import assert from "node:assert/strict";

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Independent Management API requests hold independent database transactions.
// Observe the contender waiting on the winner's transaction before accepting
// a rejection as concurrency evidence; sequential duplicate tests are insufficient.
export async function clinicConcurrencyTests(query) {
  for (const scenario of ["insert-insert", "insert-update", "update-update"]) {
    await query(`insert into public.clinics(id,name,percentage) overriding system value values
      (-11,'Race original one',10), (-12,'Race original two',20)`);
    const firstWrite =
      scenario === "update-update"
        ? `update public.clinics set name='Race target' where id=-11`
        : `insert into public.clinics(name,percentage) values ('Race target',30)`;
    const secondWrite =
      scenario === "insert-insert"
        ? `insert into public.clinics(name,percentage) values (E'\\tRACE TARGET\\n',40)`
        : `update public.clinics set name=' RACE TARGET ' where id=-12`;
    const settle = (promise) =>
      promise.then(
        (value) => ({ value }),
        (error) => ({ error }),
      );
    const first = settle(
      query(`begin; set local application_name='clinic-race-first';
      set local statement_timeout='30s'; ${firstWrite}; select pg_sleep(15); commit;`),
    );
    let second;
    try {
      const waitFor = async (sql, message) => {
        for (let attempt = 0; attempt < 40; attempt++) {
          const rows = await query(sql);
          if (rows.length) return rows;
          await pause(100);
        }
        assert.fail(message);
      };
      const winner = await waitFor(
        `select pid from pg_stat_activity
        where application_name='clinic-race-first' and wait_event='PgSleep'`,
        "Winner did not hold an uncommitted conflicting write",
      );
      second = settle(
        query(`begin; set local application_name='clinic-race-second';
        set local statement_timeout='30s'; ${secondWrite}; commit;`),
      );
      const contender = await waitFor(
        `select pid from pg_stat_activity
        where application_name='clinic-race-second' and wait_event_type='Lock'
          and wait_event='transactionid'`,
        "Contender did not wait on concurrent uniqueness",
      );
      assert.notEqual(winner[0].pid, contender[0].pid);
      assert.equal((await first).error, undefined, "Concurrent winner failed");
      assert.equal(
        (await second).error?.sqlState,
        "23505",
        "Concurrent contender must fail uniquely",
      );
      assert.deepEqual(
        await query(`select count(*)::integer as count from public.clinics
        where public.clinic_name_key(name)='race target'`),
        [{ count: 1 }],
      );
      console.log(
        `Concurrent ${scenario}: separate backends, lock observed, one winner and SQLSTATE 23505`,
      );
    } finally {
      await first;
      if (second) await second;
      await query(
        `delete from public.clinics where public.clinic_name_key(name) like 'race %'`,
      );
    }
  }
}

export async function clinicSeedTests(query, seed) {
  const rows = () =>
    query(
      "select id,name,percentage::text,active from public.clinics order by id",
    );
  await query(seed);
  const first = await rows();
  assert.equal(first.length, 3);
  assert.ok(first.some((row) => row.percentage === "0" && row.active));
  assert.ok(first.some((row) => row.percentage === "100" && !row.active));
  assert.ok(first.some((row) => row.percentage === "37.25"));
  await query(seed);
  assert.deepEqual(await rows(), first);
  console.log(
    "Synthetic seed repeatability, exact boundaries and active/inactive examples passed",
  );
}

export async function clinicNegativeControls(query, sqlTests) {
  for (const mutation of [
    "alter table public.clinics alter column percentage type numeric(5,2)",
    "alter table public.clinics drop constraint clinics_percentage_precision",
    "alter table public.clinics drop constraint clinics_percentage_range",
    "alter table public.clinics drop constraint clinics_name_nonblank",
    "alter table public.clinics drop constraint clinics_name_length",
    "drop index public.clinics_name_key_unique",
  ]) {
    await assert.rejects(
      query(`begin; ${mutation}; ${sqlTests}; rollback;`),
      (error) => error.status === 400,
      `Database suite must reject regression: ${mutation}`,
    );
    console.log(`Clinic negative control rejected: ${mutation}`);
  }
}
