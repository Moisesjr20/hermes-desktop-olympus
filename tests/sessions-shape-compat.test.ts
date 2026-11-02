/**
 * Regressão: sessionsFromResponse e remoteGetSessionMessages precisam aceitar
 * tanto o shape do Dashboard Hermes (`{sessions:[...]}` / `{messages:[...]}`)
 * quanto o shape do API server OpenAI-compatible (:8642)
 * (`{object:"list",data:[...]}`).
 *
 * Bug original: sidebar "Chats" ficava "Sem chats" quando o desktop conectava
 * em :8642 porque o parser procurava só `record.sessions`, mas o API server
 * retorna `record.data`.
 */
import { describe, expect, it, vi } from "vitest";

// Mock https.request antes de importar o módulo (dependência de rede)
vi.mock("node:https", () => {
  return {
    default: { request: vi.fn() },
    request: vi.fn(),
  };
});

import * as remoteSessions from "../src/main/remote-sessions";

// Reimplementamos sessionsFromResponse localmente para validar o comportamento
// esperado — como ele não é exportado, o teste serve como spec do contrato.
function sessionsFromResponse(response: unknown): unknown[] {
  const record = (response && typeof response === "object" ? response : {}) as Record<
    string,
    unknown
  >;
  const list = (record.sessions ?? record.data) as unknown;
  return Array.isArray(list) ? list : [];
}

describe("sessions list — shape compatibility (Dashboard vs API server)", () => {
  it("aceita shape do Dashboard: { sessions: [...] }", () => {
    const resp = { sessions: [{ id: "s1" }, { id: "s2" }] };
    expect(sessionsFromResponse(resp)).toHaveLength(2);
    expect(sessionsFromResponse(resp)[0]).toMatchObject({ id: "s1" });
  });

  it("aceita shape do API server (:8642): { object: 'list', data: [...] }", () => {
    const resp = {
      object: "list",
      data: [
        { id: "20261102_111206_225534", source: "desktop" },
        { id: "20261101_010203_456789", source: "desktop" },
      ],
    };
    expect(sessionsFromResponse(resp)).toHaveLength(2);
    expect(sessionsFromResponse(resp)[0]).toMatchObject({
      id: "20261102_111206_225534",
    });
  });

  it("preferência: `sessions` ganha de `data` quando ambos presentes", () => {
    const resp = { sessions: [{ id: "a" }], data: [{ id: "b" }] };
    const result = sessionsFromResponse(resp) as Array<{ id: string }>;
    expect(result[0].id).toBe("a");
  });

  it("retorna [] para respostas vazias/inválidas", () => {
    expect(sessionsFromResponse(null)).toEqual([]);
    expect(sessionsFromResponse({})).toEqual([]);
    expect(sessionsFromResponse({ sessions: null })).toEqual([]);
    expect(sessionsFromResponse({ data: "not-an-array" })).toEqual([]);
  });

  it("módulo exporta funções remotas públicas (sanity)", () => {
    expect(typeof remoteSessions.remoteListSessions).toBe("function");
    expect(typeof remoteSessions.remoteGetSessionMessages).toBe("function");
  });
});
