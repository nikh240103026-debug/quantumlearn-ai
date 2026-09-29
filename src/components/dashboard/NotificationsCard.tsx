"use client";

import Link from "next/link";
import { ArrowRight, Bell, Check } from "lucide-react";
import { useState } from "react";

import type { DashboardNotification } from "@/types/personal-dashboard";

interface Props {
  notifications: DashboardNotification[];
}

export function NotificationsCard({
  notifications: initialNotifications,
}: Props) {
  const [notifications, setNotifications] =
    useState(initialNotifications);

  const unread = notifications.filter(
    (item) => !item.read,
  ).length;

  async function markRead(id: string) {
    setNotifications((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, read: true }
          : item,
      ),
    );

    await fetch("/api/dashboard/notifications", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });
  }

  async function markAllRead() {
    setNotifications((current) =>
      current.map((item) => ({
        ...item,
        read: true,
      })),
    );

    await fetch("/api/dashboard/notifications", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ all: true }),
    });
  }

  return (
    <section className="border border-black/10 bg-white p-8 sm:p-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            Notifications
          </p>

          <h2 className="mt-4 text-3xl font-medium tracking-[-0.04em]">
            Stay updated
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {unread > 0 && (
            <span className="text-xs font-semibold text-blue-600">
              {unread} unread
            </span>
          )}

          {unread > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs font-semibold uppercase tracking-[0.12em] text-black/40 hover:text-blue-600"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="mt-10 border-y border-dashed border-black/15 py-12">
          <Bell size={20} className="text-black/30" />

          <p className="mt-5 text-sm font-semibold">
            You are all caught up.
          </p>

          <p className="mt-2 text-sm leading-6 text-black/45">
            Important learning and platform updates will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-8 border-t border-black/10">
          {notifications.map((notification) => {
            const content = (
              <div
                className={`flex gap-4 border-b border-black/10 py-5 ${
                  notification.read
                    ? ""
                    : "bg-blue-50/40"
                }`}
              >
                <div
                  className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center ${
                    notification.read
                      ? "bg-black/5 text-black/30"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  {notification.read ? (
                    <Check size={14} />
                  ) : (
                    <Bell size={14} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-sm font-semibold">
                      {notification.title}
                    </h3>

                    <span className="shrink-0 text-[10px] text-black/30">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>

                  <p className="mt-1 text-xs leading-5 text-black/45">
                    {notification.message}
                  </p>
                </div>
              </div>
            );

            if (notification.href) {
              return (
                <Link
                  key={notification.id}
                  href={notification.href}
                  onClick={() => markRead(notification.id)}
                  className="block"
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={notification.id}
                type="button"
                onClick={() => markRead(notification.id)}
                className="block w-full text-left"
              >
                {content}
              </button>
            );
          })}
        </div>
      )}

      {notifications.length > 0 && (
        <Link
          href="/settings?tab=notifications"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
        >
          Notification settings
          <ArrowRight size={15} />
        </Link>
      )}
    </section>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}