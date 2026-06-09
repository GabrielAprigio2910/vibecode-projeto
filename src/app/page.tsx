"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit() {
    try {
      setError("");

      const res = await fetch("/api/users");
      const users = await res.json();

      const existingUser = users.find(
        (user: any) =>
          user.email === email &&
          user.senha === senha
      );

      if (isLogin) {
        if (!existingUser) {
          setError("Email ou senha inválidos");
          return;
        }

        localStorage.setItem(
          "userId",
          String(existingUser.id)
        );

        router.push("/dashboard");
        return;
      }

      const createRes = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          senha,
        }),
      });

      if (!createRes.ok) {
        setError("Usuário já existe");
        return;
      }

      const createdUser = await createRes.json();

      const userId =
        createdUser.id ?? createdUser.user?.id;

      if (!userId) {
        setError("Erro ao obter usuário criado");
        return;
      }

      localStorage.setItem(
        "userId",
        String(userId)
      );

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Erro no servidor");
    }
  }

  return (
    <main className={styles.container}>
      <div className={styles.glow}></div>

      <section className={styles.hero}>
        <span className={styles.badge}>
          Sistema Kanban
        </span>

        <h1 className={styles.title}>
          Bem-vindo ao
          <span> Kanban Flow</span>
        </h1>

        <p className={styles.subtitle}>
          Organize suas tarefas de forma simples,
          rápida e moderna.
        </p>
      </section>

      <section className={styles.card}>
        <div className={styles.tabs}>
          <button
            className={
              isLogin
                ? styles.activeTab
                : styles.tab
            }
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>

          <button
            className={
              !isLogin
                ? styles.activeTab
                : styles.tab
            }
            onClick={() => setIsLogin(false)}
          >
            Cadastro
          </button>
        </div>

        <div className={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) =>
              setSenha(e.target.value)
            }
          />

          {error && (
            <p className={styles.error}>
              {error}
            </p>
          )}

          <button
            className={styles.submitButton}
            onClick={handleSubmit}
          >
            {isLogin
              ? "Entrar"
              : "Criar Conta"}
          </button>
        </div>
      </section>
    </main>
  );
}