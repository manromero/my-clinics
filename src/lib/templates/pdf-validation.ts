import "server-only";

import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { Worker } from "node:worker_threads";
import { PDFDocument } from "pdf-lib";

import {
  templateByteLimit,
  templateValidatorVersion,
  requiredTemplateFields,
  type PdfValidation,
} from "./pdf-contract";
export {
  templateByteLimit,
  templateValidatorVersion,
  requiredTemplateFields,
  type PdfValidation,
} from "./pdf-contract";

// A hard worker deadline and heap bound protect the request process from parser
// work in malformed/compressed PDFs. The worker receives a copy, never user code.
export async function validateTemplatePdf(
  bytes: Uint8Array,
): Promise<PdfValidation> {
  if (bytes.byteLength > templateByteLimit)
    return { valid: false, reason: "too-large" };
  if (!bytes.byteLength) return { valid: false, reason: "unreadable" };
  if (typeof PDFDocument.load !== "function")
    throw new Error("PDF parser unavailable");
  // Resolve at runtime from the deployed app, not from a statically analyzable
  // module URL: Turbopack otherwise substitutes its numeric module ID, which a
  // native worker cannot require.
  const parser = createRequire(`${process.cwd()}/package.json`).resolve(
    "pdf-lib",
  );
  const result = await new Promise<
    Exclude<PdfValidation, { valid: true }> | { valid: true }
  >((resolve) => {
    const worker = new Worker(
      `
      const {parentPort,workerData}=require('node:worker_threads');
      const {PDFDocument,PDFTextField,EncryptedPDFError}=require(workerData.parser);
      (async()=>{
        try{
          const pdf=await PDFDocument.load(workerData.bytes,{ignoreEncryption:false});
          if(pdf.isEncrypted){parentPort.postMessage({valid:false,reason:'encrypted'});return;}
          if(!pdf.getPageCount())throw Error('No pages');
          const form=pdf.getForm(),missing=[],wrong=[];
          for(const name of workerData.fields){
            const field=form.getFieldMaybe(name);
            if(!field)missing.push(name);else if(!(field instanceof PDFTextField))wrong.push(name);
          }
          parentPort.postMessage(missing.length?{valid:false,reason:'missing-fields',fields:missing}:
            wrong.length?{valid:false,reason:'wrong-field-type',fields:wrong}:{valid:true});
        }catch(error){parentPort.postMessage({valid:false,reason:error.message===new EncryptedPDFError().message?'encrypted':'unreadable'});}
      })();`,
      {
        eval: true,
        execArgv: [],
        workerData: { parser, bytes, fields: requiredTemplateFields },
        resourceLimits: {
          maxOldGenerationSizeMb: 128,
          maxYoungGenerationSizeMb: 16,
          stackSizeMb: 4,
        },
        stderr: true,
      },
    );
    let settled = false;
    const done = (
      value: Exclude<PdfValidation, { valid: true }> | { valid: true },
    ) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      void worker.terminate();
      resolve(value);
    };
    const timer = setTimeout(
      () => done({ valid: false, reason: "unreadable" }),
      5000,
    );
    worker.once("message", done);
    worker.once("error", () => done({ valid: false, reason: "unreadable" }));
    worker.once("exit", () => done({ valid: false, reason: "unreadable" }));
  });
  return result.valid
    ? {
        valid: true,
        sha256: createHash("sha256").update(bytes).digest("hex"),
        bytes: bytes.byteLength,
        validator: templateValidatorVersion,
      }
    : result;
}
