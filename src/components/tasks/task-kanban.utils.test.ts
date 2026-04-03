import { describe, expect, it } from "vitest";
import {
  getAdjacentTaskStatus,
  getKeyboardMoveStatus,
  groupTasksByStatus,
  isTaskOverdue,
  moveTaskToStatus,
  type KanbanTask,
} from "./task-kanban.utils";

const baseTasks: KanbanTask[] = [
  {
    id: "task-1",
    trackingId: "TF-1",
    title: "Task 1",
    status: "TODO",
    priority: "HIGH",
    paymentStatus: "UNPAID",
    price: 100000,
    dueDate: "2026-04-02T00:00:00.000Z",
    clientName: "Ahmad",
    assigneeDisplayName: "Eggi",
  },
  {
    id: "task-2",
    trackingId: "TF-2",
    title: "Task 2",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    paymentStatus: "DP",
    price: 250000,
    dueDate: null,
    clientName: "Sarah",
    assigneeDisplayName: null,
  },
];

describe("task-kanban.utils", () => {
  it("moves task to target status and returns previous status", () => {
    const result = moveTaskToStatus(baseTasks, "task-1", "IN_PROGRESS");

    expect(result.changed).toBe(true);
    expect(result.previousStatus).toBe("TODO");
    expect(result.nextTasks.find((task) => task.id === "task-1")?.status).toBe("IN_PROGRESS");
  });

  it("does not change state when dropping to same status", () => {
    const result = moveTaskToStatus(baseTasks, "task-1", "TODO");

    expect(result.changed).toBe(false);
    expect(result.previousStatus).toBe("TODO");
    expect(result.nextTasks).toBe(baseTasks);
  });

  it("does not change state when task is not found", () => {
    const result = moveTaskToStatus(baseTasks, "unknown", "IN_REVIEW");

    expect(result.changed).toBe(false);
    expect(result.previousStatus).toBeNull();
    expect(result.nextTasks).toBe(baseTasks);
  });

  it("marks task overdue only for active status", () => {
    const now = new Date("2026-04-03T00:00:00.000Z");

    expect(isTaskOverdue(baseTasks[0], now)).toBe(true);

    const completedTask: KanbanTask = {
      ...baseTasks[0],
      status: "COMPLETED",
    };
    expect(isTaskOverdue(completedTask, now)).toBe(false);
  });

  it("groups tasks by board column statuses", () => {
    const groups = groupTasksByStatus(baseTasks);

    expect(groups).toHaveLength(5);
    expect(groups.find((group) => group.status === "TODO")?.tasks).toHaveLength(1);
    expect(groups.find((group) => group.status === "IN_PROGRESS")?.tasks).toHaveLength(1);
    expect(groups.find((group) => group.status === "COMPLETED")?.tasks).toHaveLength(0);
  });

  it("returns adjacent status for next and previous moves", () => {
    expect(getAdjacentTaskStatus("TODO", "next")).toBe("IN_PROGRESS");
    expect(getAdjacentTaskStatus("IN_PROGRESS", "previous")).toBe("TODO");
    expect(getAdjacentTaskStatus("DRAFT", "previous")).toBeNull();
    expect(getAdjacentTaskStatus("COMPLETED", "next")).toBeNull();
  });

  it("maps Alt + Arrow keys to keyboard status movement", () => {
    expect(getKeyboardMoveStatus("TODO", "ArrowRight", true)).toBe("IN_PROGRESS");
    expect(getKeyboardMoveStatus("IN_REVIEW", "ArrowLeft", true)).toBe("IN_PROGRESS");
    expect(getKeyboardMoveStatus("TODO", "ArrowRight", false)).toBeNull();
    expect(getKeyboardMoveStatus("TODO", "Enter", true)).toBeNull();
  });
});