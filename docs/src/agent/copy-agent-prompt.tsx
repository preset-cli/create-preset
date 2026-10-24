'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Textarea } from 'blackwork'
import { Check, Copy } from 'lucide-react'
import { createAgentPrompt } from './prompt'
import { getMessages, type Locale } from '@/locales'

export const CopyAgentPrompt = ({ locale, pagePath }: { locale: Locale; pagePath?: string }) => {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle')
  const prompt = createAgentPrompt(locale, pagePath)
  const { label, description, copied, failed, promptLabel } = getMessages(locale).agent

  useEffect(() => {
    if (status !== 'copied') return
    const timeout = setTimeout(() => setStatus('idle'), 2500)
    return () => clearTimeout(timeout)
  }, [status])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setStatus('copied')
    } catch {
      setStatus('failed')
    }
  }

  return (
    <span className="not-prose inline-flex" data-pagefind-ignore="all">
      <button
        type="button"
        onClick={copy}
        title={description}
        aria-label={label}
        className="inline-flex min-h-8 items-center gap-1.5 whitespace-nowrap rounded-sm text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        {status === 'copied' ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
        <span className="grid" aria-hidden="true">
          <span className={`col-start-1 row-start-1 ${status === 'copied' ? 'invisible' : ''}`}>{label}</span>
          {status === 'copied' && <span className="col-start-1 row-start-1">{copied}</span>}
        </span>
      </button>
      <span role="status" className="sr-only">
        {status === 'copied' ? copied : status === 'failed' ? failed : ''}
      </span>
      <Dialog open={status === 'failed'} onOpenChange={(open) => { if (!open) setStatus('idle') }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription>{failed}</DialogDescription>
          </DialogHeader>
          <Textarea
            aria-label={promptLabel}
            value={prompt}
            readOnly
            rows={7}
            onFocus={(event) => event.currentTarget.select()}
          />
        </DialogContent>
      </Dialog>
    </span>
  )
}
