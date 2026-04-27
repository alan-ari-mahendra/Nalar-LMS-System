"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  createDiscussion,
  replyDiscussion,
  deleteDiscussion,
  deleteDiscussionReply,
} from "@/lib/actions/discussion"
import { Avatar } from "@/components/shared/Avatar"
import type { DiscussionWithReplies } from "@/lib/queries"

type ReplyItem = DiscussionWithReplies["replies"][number]

interface DiscussionPanelProps {
  lessonId: string
  currentUserId: string
  isInstructorOrAdmin: boolean
  discussions: DiscussionWithReplies[]
}

function relativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const diff = Math.floor((Date.now() - d.getTime()) / 1000)
  if (diff < 60) return "just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return d.toLocaleDateString()
}

export function DiscussionPanel({
  lessonId,
  currentUserId,
  isInstructorOrAdmin,
  discussions,
}: DiscussionPanelProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [body, setBody] = useState("")
  const [error, setError] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyBody, setReplyBody] = useState("")

  function handlePost() {
    if (!body.trim()) return
    setError("")
    startTransition(async () => {
      const result = await createDiscussion({ lessonId, body: body.trim() })
      if (!result.success) {
        setError(result.error)
        return
      }
      setBody("")
      router.refresh()
    })
  }

  function handleReply(discussionId: string) {
    if (!replyBody.trim()) return
    setError("")
    startTransition(async () => {
      const result = await replyDiscussion({ discussionId, body: replyBody.trim() })
      if (!result.success) {
        setError(result.error)
        return
      }
      setReplyBody("")
      setReplyingTo(null)
      router.refresh()
    })
  }

  function handleDeleteDiscussion(id: string) {
    if (!window.confirm("Delete this discussion and all replies?")) return
    startTransition(async () => {
      const result = await deleteDiscussion({ discussionId: id })
      if (!result.success) setError(result.error)
      else router.refresh()
    })
  }

  function handleDeleteReply(replyId: string) {
    if (!window.confirm("Delete this reply?")) return
    startTransition(async () => {
      const result = await deleteDiscussionReply({ replyId })
      if (!result.success) setError(result.error)
      else router.refresh()
    })
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* New post */}
      <div className="bg-surface-container border border-outline-variant rounded-xl p-4 space-y-3">
        <h4 className="font-bold text-sm">Ask a question or share an insight</h4>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="What's on your mind about this lesson?"
          className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant resize-none focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="flex items-center justify-between">
          {error && <span className="text-xs text-error">{error}</span>}
          <button
            type="button"
            onClick={handlePost}
            disabled={isPending || !body.trim()}
            className="ml-auto bg-primary text-on-primary px-4 py-1.5 rounded-md text-sm font-bold hover:brightness-110 transition-all disabled:opacity-50"
          >
            {isPending ? "Posting..." : "Post"}
          </button>
        </div>
      </div>

      {discussions.length === 0 ? (
        <div className="text-center py-12 text-on-surface-variant">
          <span className="material-symbols-outlined !text-5xl opacity-40">forum</span>
          <p className="text-sm mt-3">No discussions yet. Start the conversation.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {discussions.map((d) => {
            const canDelete = d.user.id === currentUserId || isInstructorOrAdmin
            return (
              <div
                key={d.id}
                className="bg-surface-container border border-outline-variant rounded-xl p-4 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <Avatar src={d.user.avatarUrl} name={d.user.name ?? "User"} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-on-surface">
                        {d.user.name ?? "User"}
                      </span>
                      {d.user.role === "TEACHER" && (
                        <span className="text-[10px] uppercase tracking-wider bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                          Instructor
                        </span>
                      )}
                      <span className="text-xs text-on-surface-variant">
                        {relativeTime(d.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface mt-1 whitespace-pre-wrap">{d.body}</p>
                  </div>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDeleteDiscussion(d.id)}
                      aria-label="Delete discussion"
                      className="text-on-surface-variant hover:text-error transition-colors"
                    >
                      <span className="material-symbols-outlined !text-base">delete</span>
                    </button>
                  )}
                </div>

                {/* Replies */}
                {d.replies.length > 0 && (
                  <div className="pl-11 space-y-3 border-l border-outline-variant ml-4">
                    {d.replies.map((r: ReplyItem) => {
                      const canDeleteReply = r.user.id === currentUserId || isInstructorOrAdmin
                      return (
                        <div key={r.id} className="flex items-start gap-3">
                          <Avatar src={r.user.avatarUrl} name={r.user.name ?? "User"} size="sm" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs text-on-surface">
                                {r.user.name ?? "User"}
                              </span>
                              {r.user.role === "TEACHER" && (
                                <span className="text-[10px] uppercase tracking-wider bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                                  Instructor
                                </span>
                              )}
                              <span className="text-xs text-on-surface-variant">
                                {relativeTime(r.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-on-surface mt-1 whitespace-pre-wrap">
                              {r.body}
                            </p>
                          </div>
                          {canDeleteReply && (
                            <button
                              type="button"
                              onClick={() => handleDeleteReply(r.id)}
                              aria-label="Delete reply"
                              className="text-on-surface-variant hover:text-error transition-colors"
                            >
                              <span className="material-symbols-outlined !text-base">close</span>
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Reply form */}
                {replyingTo === d.id ? (
                  <div className="pl-11 space-y-2">
                    <textarea
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      rows={2}
                      placeholder="Write a reply..."
                      autoFocus
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleReply(d.id)}
                        disabled={isPending || !replyBody.trim()}
                        className="bg-primary text-on-primary px-3 py-1 rounded-md text-xs font-bold disabled:opacity-50"
                      >
                        {isPending ? "Replying..." : "Reply"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingTo(null)
                          setReplyBody("")
                        }}
                        className="text-xs text-on-surface-variant hover:text-on-surface px-2 py-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setReplyingTo(d.id)
                      setReplyBody("")
                    }}
                    className="ml-11 text-xs text-primary hover:underline"
                  >
                    Reply
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
