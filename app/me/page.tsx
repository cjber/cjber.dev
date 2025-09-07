'use client'

import { useState, useEffect, useRef, ReactElement } from 'react'
import { useRouter } from 'next/navigation'

const fontSize = '16px'
const lineHeight = '1.6'

export default function Home() {
  const router = useRouter()
  const [currentInput, setCurrentInput] = useState('')
  const [history, setHistory] = useState<(ReactElement | null)[]>([])
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [loginTime, setLoginTime] = useState('Loading...')
  const [cursorPosition, setCursorPosition] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Update time every second
    const updateTime = () => {
      const now = new Date()
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Europe/London',
        timeZoneName: 'short'
      }
      setLoginTime(now.toLocaleString('en-GB', options))
    }
    
    updateTime() // Set initial time
    const timeInterval = setInterval(updateTime, 1000) // Update every second
    
    // Auto focus on mount
    const focusTimer = setInterval(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        clearInterval(focusTimer)
      }
    }, 100)
    
    return () => {
      clearInterval(timeInterval)
      clearInterval(focusTimer)
    }
  }, [])

  // Update cursor position when input changes
  useEffect(() => {
    setCursorPosition(currentInput.length)
  }, [currentInput])

  const commands: Record<string, () => string | ReactElement> = {
    help: () => (
      <div>
        <div className="text-primary">Available commands:</div>
        <div className="text-muted-foreground ml-4">help     - Show this help menu</div>
        <div className="text-muted-foreground ml-4">whoami   - Display user information</div>
        <div className="text-muted-foreground ml-4">links    - Show my links</div>
        <div className="text-muted-foreground ml-4">clear    - Clear terminal</div>
        <div className="text-muted-foreground ml-4">echo     - Print text</div>
        <div className="text-muted-foreground ml-4">cd       - Navigate (cd .. returns home)</div>
      </div>
    ),
    whoami: () => (
      <div>
        <div className="text-foreground">Cillian Berragan</div>
        <div className="text-muted-foreground">Software engineer @ <a href="https://thirdweb.com" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-primary transition-colors">thirdweb</a></div>
      </div>
    ),
    links: () => (
      <div>
        <div className="text-foreground ml-4">
          <a href="https://github.com/cjber" target="_blank" rel="noopener noreferrer" 
             className="text-secondary hover:text-primary transition-colors">
            GitHub
          </a>
        </div>
        <div className="text-foreground ml-4">
          <a href="https://linkedin.com/in/cjberr" target="_blank" rel="noopener noreferrer"
             className="text-secondary hover:text-primary transition-colors">
            LinkedIn
          </a>
        </div>
        <div className="text-foreground ml-4">
          <a href="mailto:cjberragan@gmail.com"
             className="text-secondary hover:text-primary transition-colors">
            Email
          </a>
        </div>
      </div>
    ),
    clear: () => {
      setHistory([])
      return ''
    },
    echo: () => {
      const text = currentInput.replace(/^echo\s+/, '')
      return text || ''
    },
    cd: () => {
      const args = currentInput.replace(/^cd\s*/, '').trim()
      if (!args || args === '..' || args === '../' || args === '~' || args === '/') {
        router.push('/')
        return ''
      }
      return `bash: cd: ${args}: No such file or directory`
    }
  }

  const handleCommand = (input: string) => {
    const trimmedInput = input.trim()
    const [command, ...args] = trimmedInput.split(' ')
    
    const newEntry = (
      <div className="mb-2">
        <span className="text-primary">cjber@dev</span>
        <span className="text-foreground">:</span>
        <span className="text-secondary">~</span>
        <span className="text-foreground">$ </span>
        <span className="text-foreground">{trimmedInput}</span>
      </div>
    )
    
    if (trimmedInput && command !== 'clear') {
      setCommandHistory(prev => [...prev, trimmedInput])
    }
    
    if (command === 'clear') {
      commands.clear()
      return
    }
    
    let output = null
    if (trimmedInput) {
      if (command in commands) {
        const result = commands[command]()
        if (result) {
          output = (
            <div className="mb-3 text-foreground">
              {typeof result === 'string' ? result : result}
            </div>
          )
        }
      } else if (trimmedInput) {
        output = (
          <div className="mb-3 text-destructive">
            bash: {command}: command not found
          </div>
        )
      }
    }
    
    setHistory(prev => [...prev, newEntry, output].filter(Boolean))
    setHistoryIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(currentInput)
      setCurrentInput('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setCurrentInput('')
      }
    }
  }

  return (
    <div 
      className="min-h-screen bg-background text-foreground p-8 font-mono overflow-hidden"
      style={{ fontSize, lineHeight }}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 text-muted-foreground">
          Last login: {loginTime}
        </div>
        
        <div className="mb-4 text-foreground">
          <div>Welcome to cjber.dev terminal</div>
          <div>Type 'help' for available commands</div>
        </div>
        
        <div 
          ref={terminalRef}
          className="terminal-scroll overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 200px)' }}
        >
          {history.map((item, index) => (
            <div key={index}>{item}</div>
          ))}
          
          <div className="flex items-center">
            <span className="text-primary">cjber@dev</span>
            <span className="text-foreground">:</span>
            <span className="text-secondary">~</span>
            <span className="text-foreground">$</span>
            <span>&nbsp;</span>
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-transparent border-none outline-none text-foreground w-full"
                style={{ 
                  caretColor: 'transparent',
                  fontSize,
                }}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
              <span 
                className="absolute top-0 pointer-events-none text-primary cursor-blink"
                style={{ 
                  left: `${cursorPosition * 0.6}em`,
                  fontSize,
                }}
              >
                █
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
