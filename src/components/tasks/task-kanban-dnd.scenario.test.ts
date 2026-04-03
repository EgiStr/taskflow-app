import { describe, expect, it } from "vitest";
import {
  getKeyboardMoveStatus,
  moveTaskToStatus,
  type KanbanTask,
} from "./task-kanban.utils";

const board: KanbanTask[] = [
  {
    id: "task-1",
    trackingId: "TF-1001",
    title: "Landing Page Revamp",
    status: "TODO",
    priority: "HIGH",
    paymentStatus: "UNPAID",
    price: 1500000,
    dueDate: null,
    clientName: "PT Maju Jaya",
    assigneeDisplayName: "Eggi",
  },
  {
    id: "task-2",
    trackingId: "TF-1002",
    title: "Copywriting Batch",
    status: "IN_REVIEW",
    priority: "MEDIUM",
    paymentStatus: "DP",
    price: 800000,
    dueDate: null,
    clientName: "CV Nusantara",
    assigneeDisplayName: "Rahma",
  },
];

describe("Scenario: Kanban Drag & Drop", () => {
  it("moves task to next step when dropped to a later column", () => {
    const step = moveTaskToStatus(board, "task-1", "IN_PROGRESS");

    expect(step.changed).toBe(true);
    expect(step.previousStatus).toBe("TODO");
    expect(step.nextTasks.find((task) => task.id === "task-1")?.status).toBe("IN_PROGRESS");
  });

  it("supports moving task to previous step by dropping to earlier column", () => {
    const step = moveTaskToStatus(board, "task-2", "TODO");

    expect(step.changed).toBe(true);
    expect(step.previousStatus).toBe("IN_REVIEW");
    expect(step.nextTasks.find((task) => task.id === "task-2")?.status).toBe("TODO");
  });

  it("rolls back optimistic move when server update fails", () => {
    const optimistic = moveTaskToStatus(board, "task-1", "IN_PROGRESS");
    const rolledBack = moveTaskToStatus(
      optimistic.nextTasks,
      "task-1",
      optimistic.previousStatus || "TODO"
    );

    expect(optimistic.changed).toBe(true);
    expect(rolledBack.nextTasks.find((task) => task.id === "task-1")?.status).toBe("TODO");
  });

  it("supports keyboard move using Alt + Arrow keys", () => {
    const nextStatus = getKeyboardMoveStatus("TODO", "ArrowRight", true);
    expect(nextStatus).toBe("IN_PROGRESS");

    const moved = moveTaskToStatus(board, "task-1", nextStatus || "TODO");
    expect(moved.nextTasks.find((task) => task.id === "task-1")?.status).toBe("IN_PROGRESS");

    const previousStatus = getKeyboardMoveStatus("IN_PROGRESS", "ArrowLeft", true);
    expect(previousStatus).toBe("TODO");
  });
});