import { describe, expect, it } from "vitest";
import {
  invoiceFields,
  madridToday,
  validInvoiceNumber,
  validIssueDate,
} from "./invoice-contracts";

describe("invoice output contracts", () => {
  it.each(["1", "9999", "0016", "0001"])(
    "accepts number %s without coercion",
    (number) => {
      expect(validInvoiceNumber(number)).toBe(true);
      expect(
        invoiceFields({ number, date: "", gross: "" }).invoice_number,
      ).toBe(number);
    },
  );
  it.each(["", "0", "0000", " 1", "1 ", "1a", "10000", "1.0", "-1"])(
    "rejects number %s",
    (value) => expect(validInvoiceNumber(value)).toBe(false),
  );
  it.each(["29/02/2024", "01/01/0001", "31/12/9999"])(
    "accepts date %s",
    (value) => expect(validIssueDate(value)).toBe(true),
  );
  it.each([
    "29/02/2023",
    "29/02/1900",
    "31/04/2026",
    "00/01/2026",
    "01/13/2026",
    "01/01/0000",
    "2026-11-26",
    "1/1/2026",
  ])("rejects date %s", (value) => expect(validIssueDate(value)).toBe(false));
  it("defaults to the Madrid date across UTC midnight and summer time", () => {
    expect(madridToday(new Date("2026-11-25T23:30:00Z"))).toBe("26/11/2026");
    expect(madridToday(new Date("2026-06-25T22:30:00Z"))).toBe("26/06/2026");
  });
  it.each([
    ["100", "100,00 €", "15,00 €", "85,00 €"],
    ["0.10", "0,10 €", "0,02 €", "0,08 €"],
    ["0,01", "0,01 €", "0,00 €", "0,01 €"],
    ["1234.56", "1.234,56 €", "185,18 €", "1.049,38 €"],
    [
      "999999999999999999.99",
      "999.999.999.999.999.999,99 €",
      "150.000.000.000.000.000,00 €",
      "849.999.999.999.999.999,99 €",
    ],
  ])("calculates exact fixed IRPF for %s", (gross, amount, retained, net) => {
    expect(invoiceFields({ number: "", date: "", gross })).toEqual({
      invoice_number: "",
      issue_date: "",
      gross_amount: amount,
      withholding_amount: retained,
      net_amount: net,
    });
  });
  it.each(["", "0", "-1", "0.001", "1.234", "1 ", "abc", "1,"])(
    "blanks all calculations for invalid gross %s",
    (gross) => {
      expect(
        invoiceFields({ number: "0016", date: "29/02/2024", gross }),
      ).toEqual({
        invoice_number: "0016",
        issue_date: "29/02/2024",
        gross_amount: "",
        withholding_amount: "",
        net_amount: "",
      });
    },
  );
});
