import assert from "node:assert/strict";

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function activityConcurrencyTests(query) {
  const owner = "00000000-0000-4000-8000-000000000035";
  const asOwner = `set local role authenticated;
    set local request.jwt.claims='{"sub":"${owner}","role":"authenticated"}';`;
  await query(`insert into auth.users(id) values ('${owner}');
    insert into public.clinics(id,owner_id,name,percentage) overriding system value values
      (-35,'${owner}','Concurrent activity destination',10),
      (-36,'${owner}','Concurrent activity source',40);`);

  try {
    await query(`begin; ${asOwner}
      select public.create_activity('-36','2026-01-01','Existing','1','percentage',null);
      commit;`);
    for (const { label, changeClinic, saveActivity, expectedState } of [
      {
        label: "create after a rate change",
        changeClinic: "percentage=65",
        saveActivity:
          "select public.create_activity('-35','2026-01-01','New','10','percentage',null)",
        expectedState: undefined,
      },
      {
        label: "reassign after deactivation",
        changeClinic: "active=false",
        saveActivity: `select public.update_activity(
          (select id::text from public.activity where description='Existing'),
          '-35','2026-01-01','Existing','1','percentage',null
        )`,
        expectedState: "42501",
      },
    ]) {
      const settle = (promise) => promise.catch((error) => ({ error }));
      const clinic = settle(
        query(`begin; set local application_name='activity-race-clinic';
          set local statement_timeout='30s'; ${asOwner}
          update public.clinics set ${changeClinic} where id=-35;
          select pg_sleep(15); commit;`),
      );
      let activity;
      try {
        await waitForRow(
          query,
          `select pid from pg_stat_activity
            where application_name='activity-race-clinic' and wait_event='PgSleep'`,
          "Clinic change did not hold an uncommitted lock",
        );
        activity = settle(
          query(`begin; set local application_name='activity-race-save';
            set local statement_timeout='30s'; ${asOwner} ${saveActivity}; commit;`),
        );
        await waitForRow(
          query,
          `select contender.pid from pg_stat_activity contender
            join pg_stat_activity clinic on clinic.pid=any(pg_blocking_pids(contender.pid))
            where contender.application_name='activity-race-save'
              and contender.wait_event_type='Lock'
              and clinic.application_name='activity-race-clinic'`,
          "Activity write did not wait for the concurrent clinic change",
        );
        assert.equal((await clinic).error, undefined, "Clinic change failed");
        const outcome = await activity;
        if (expectedState) {
          assert.equal(outcome.error?.sqlState, expectedState, label);
        } else {
          assert.equal(outcome.error, undefined, label);
        }
        console.log(
          `Concurrent activity ${label}: clinic lock and save result verified`,
        );
      } finally {
        await clinic;
        if (activity) await activity;
      }
    }
    assert.deepEqual(
      await query(`select description, clinic_id::text as clinic_id,
        applied_percentage::text as percentage, gross::text as gross
        from public.activity where owner_id='${owner}' order by description`),
      [
        {
          description: "Existing",
          clinic_id: "-36",
          percentage: "40",
          gross: "0.40",
        },
        {
          description: "New",
          clinic_id: "-35",
          percentage: "65",
          gross: "6.50",
        },
      ],
      "Concurrent writes did not leave the expected exact activity state",
    );
  } finally {
    await query(`delete from public.activity where owner_id='${owner}';
      delete from public.clinics where owner_id='${owner}';
      delete from auth.users where id='${owner}';`);
  }
}

async function waitForRow(query, sql, message) {
  for (let attempt = 0; attempt < 40; attempt++) {
    if ((await query(sql)).length > 0) return;
    await pause(100);
  }
  assert.fail(message);
}
