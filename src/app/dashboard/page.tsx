"use client";

import { useEffect, useState } from "react";
import styles from "./dashboard.module.css";

import {
  DndContext,
  DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";

import { CSS } from "@dnd-kit/utilities";

type Task = {
  id: number;
  title: string;
  status: string;
  userId: number;
};

function DraggableTask({
  task,
  children,
}: {
  task: Task;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id: task.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
}

function DroppableColumn({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <div ref={setNodeRef}>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");

  async function loadTasks() {
    const userId = localStorage.getItem("userId");

    const res = await fetch(
      `/api/tasks?userId=${userId}`
    );

    const data = await res.json();

    setTasks(data);
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function createTask() {
    const userId = localStorage.getItem("userId");

    if (!title.trim()) return;

    await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        status: "todo",
        userId: Number(userId),
      }),
    });

    setTitle("");
    loadTasks();
  }

  async function deleteTask(id: number) {
    await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
    });

    loadTasks();
  }

  async function moveTask(
    id: number,
    status: string
  ) {
    await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
      }),
    });

    loadTasks();
  }

  async function handleDragEnd(
    event: DragEndEvent
  ) {
    const { active, over } = event;

    if (!over) return;

    const taskId = Number(active.id);
    const newStatus = String(over.id);

    await moveTask(taskId, newStatus);
  }

  const todo = tasks.filter(
    (t) => t.status === "todo"
  );

  const doing = tasks.filter(
    (t) => t.status === "doing"
  );

  const done = tasks.filter(
    (t) => t.status === "done"
  );

  const [priorityTasks, setPriorityTasks] = useState<number[]>([]);

  function togglePriority(id: number) {
    setPriorityTasks((prev) =>
      prev.includes(id)
        ? prev.filter((taskId) => taskId !== id)
        : [...prev, id]
    );
  }

  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
  {
    role: "assistant",
    content: "Olá! Sou o assistente do Kanban Flow. Como posso ajudar?"
  }
]);

async function sendMessage() {
  if (!message.trim()) return;

  const userMessage = {
    role: "user",
    content: message,
  };

  setMessages((prev) => [
    ...prev,
    userMessage,
  ]);

  const prompt = `
Estas são minhas tarefas:

${tasks
  .map(
    (t) =>
      `- ${t.title} (${t.status})`
  )
  .join("\n")}

Pergunta do usuário:
${message}

Responda como um assistente de produtividade.
`;

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type":
        "application/json",
    },
    body: JSON.stringify({
      prompt,
    }),
  });

  const data = await res.json();

  setMessages((prev) => [
    ...prev,
    {
      role: "assistant",
      content: data.response,
    },
  ]);

  setMessage("");
}

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Kanban Flow
        </h1>

        <button
          className={styles.logoutButton}
          onClick={() => {
            localStorage.removeItem("userId");
            window.location.href = "/";
          }}
        >
          Sair
        </button>
      </div>

      <div className={styles.inputArea}>
        <input
          className={styles.input}
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          placeholder="Nova tarefa..."
        />

        <button
          className={styles.button}
          onClick={createTask}
        >
          Criar
        </button>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className={styles.board}>

          <DroppableColumn id="todo">
            <div className={styles.column}>
              <div className={styles.columnTitle}>
                TO DO
              </div>

              {todo.map((task) => (
              <DraggableTask
  key={task.id}
  task={task}
>
      <div
        className={`${styles.card} ${
          priorityTasks.includes(task.id)
            ? styles.cardPriority
            : ""
        }`}
      >
        <div
          className={`${styles.priorityArrow} ${
            priorityTasks.includes(task.id)
              ? styles.priorityActive
              : ""
          }`}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={() => togglePriority(task.id)}
        >
          ▲
        </div>

        <p>{task.title}</p>

    <div className={styles.cardActions}>
      <button
        className={styles.cardButton}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={() => moveTask(task.id, "doing")}
      >
        mover →
      </button>

      <button
        className={styles.deleteButton}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={() => deleteTask(task.id)}
      >
        🗑
      </button>
    </div>
  </div>
        </DraggableTask>
            ))}
          </div>
        </DroppableColumn>

      <DroppableColumn id="doing">
        <div className={styles.column}>
          <div className={styles.columnTitle}>
            DOING
          </div>

          {doing.map((task) => (
            <DraggableTask
              key={task.id}
              task={task}
            >
              <div
              className={`${styles.card} ${
                priorityTasks.includes(task.id)
                  ? styles.cardPriority
                  : ""
              }`}
            >
              <div
                className={`${styles.priorityArrow} ${
                  priorityTasks.includes(task.id)
                    ? styles.priorityActive
                    : ""
                }`}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={() => togglePriority(task.id)}
              >
                ▲
              </div>

              <p>{task.title}</p>

                <div className={styles.cardActions}>
                  <button
                  className={styles.cardButton}
                  onMouseDown={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onClick={() => moveTask(task.id, "done")}
                >
                  concluir →
                </button>

                  <button
                className={styles.deleteButton}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={() => deleteTask(task.id)}
              >
                🗑
              </button>
              </div>
              </div>
              </DraggableTask>
              ))}
            </div>
          </DroppableColumn>

          <DroppableColumn id="done">
            <div className={styles.column}>
              <div className={styles.columnTitle}>
                DONE
              </div>

            {done.map((task) => (
              <DraggableTask
                key={task.id}
                task={task}
              >
                <div
                className={`${styles.card} ${
                  priorityTasks.includes(task.id)
                    ? styles.cardPriority
                    : ""
                }`}
              >
                <div
                  className={`${styles.priorityArrow} ${
                    priorityTasks.includes(task.id)
                      ? styles.priorityActive
                      : ""
                  }`}
                  onMouseDown={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onClick={() => togglePriority(task.id)}
                >
                  ▲
                </div>

                <p>{task.title}</p>

                  <div className={styles.cardActions}>
                    <button
                  className={styles.deleteButton}
                  onMouseDown={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onClick={() => deleteTask(task.id)}
                >
                  🗑
                </button>
                </div>
                </div>
                </DraggableTask>
              ))}

            {/* BOTÃO FLUTUANTE */}
<button
  className={styles.chatButton}
  onClick={() => setChatOpen(!chatOpen)}
>
  🤖
</button>

{/* JANELA DE CHAT */}
{chatOpen && (
  <div className={styles.chatWindow}>

    <div className={styles.chatHeader}>
      Kanban Assistant
    </div>

    <div className={styles.chatMessages}>
      {messages.map((msg, index) => (
        <div
          key={index}
          className={
            msg.role === "assistant"
              ? styles.botMessage
              : styles.userMessage
          }
        >
          {msg.content}
        </div>
      ))}
    </div>

    <div className={styles.chatInputArea}>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Digite uma pergunta..."
      />

        <button onClick={sendMessage}>
          Enviar
        </button>
    </div>

    </div>
  )}
            </div>
          </DroppableColumn>

        </div>
      </DndContext>
    </div>
  );
}