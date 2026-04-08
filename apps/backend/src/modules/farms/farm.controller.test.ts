import assert from "node:assert/strict";
import test from "node:test";

import type { NextFunction, Request, Response } from "express";

import { getFarms } from "./farm.controller";
import { Farm } from "./farm.model";

test("getFarms returns farms sorted by newest first", async () => {
  const expectedFarms = [
    { _id: "farm-new", name: "Newest Farm" },
    { _id: "farm-old", name: "Older Farm" },
  ];

  let capturedQuery: unknown;
  let capturedSort: unknown;
  let jsonPayload: unknown;
  let nextError: unknown;

  const originalFind = Farm.find;

  Farm.find = ((query: unknown) => {
    capturedQuery = query;

    return {
      sort(sort: unknown) {
        capturedSort = sort;
        return Promise.resolve(expectedFarms);
      },
    };
  }) as typeof Farm.find;

  const req = {
    tenant: {
      _id: "tenant-123",
    },
  } as Request;

  const res = {
    json(payload: unknown) {
      jsonPayload = payload;
      return this;
    },
  } as Response;

  const next = ((error?: unknown) => {
    nextError = error;
  }) as NextFunction;

  try {
    await getFarms(req, res, next);
  } finally {
    Farm.find = originalFind;
  }

  assert.deepEqual(capturedQuery, { tenantId: "tenant-123" });
  assert.deepEqual(capturedSort, { createdAt: -1 });
  assert.deepEqual(jsonPayload, { success: true, farms: expectedFarms });
  assert.equal(nextError, undefined);
});
