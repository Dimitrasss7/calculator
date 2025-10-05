'use client'

import { useState, useEffect } from 'react'

interface HistoryItem {
  expression: string
  result: string
}

export default function Calculator() {
  const [display, setDisplay] = useState('0')
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const { key } = event
      if (key >= '0' && key <= '9') {
        inputDigit(parseInt(key))
      } else if (key === '.') {
        inputDecimal()
      } else if (['+', '-', '*', '/'].includes(key)) {
        performOperation(key === '*' ? '×' : key === '/' ? '÷' : key)
      } else if (key === 'Enter' || key === '=') {
        calculate()
      } else if (key === 'Escape') {
        clear()
      } else if (key === 'Backspace') {
        if (display !== '0' && !waitingForOperand) {
          setDisplay(display.slice(0, -1) || '0')
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [display, waitingForOperand])

  const inputDigit = (digit: number) => {
    if (waitingForOperand) {
      setDisplay(String(digit))
      setWaitingForOperand(false)
    } else {
      setDisplay(display === '0' ? String(digit) : display + digit)
    }
  }

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.')
      setWaitingForOperand(false)
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.')
    }
  }

  const clear = () => {
    setDisplay('0')
    setPreviousValue(null)
    setOperation(null)
    setWaitingForOperand(false)
  }

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display)

    if (previousValue === null) {
      setPreviousValue(inputValue)
    } else if (operation) {
      const currentValue = previousValue || 0
      const newValue = calculate(currentValue, inputValue, operation)

      setDisplay(`${parseFloat(newValue.toFixed(7))}`)
      setPreviousValue(newValue)
    }

    setWaitingForOperand(true)
    setOperation(nextOperation)
  }

  const calculate = (firstValue?: number, secondValue?: number, operation?: string) => {
    const prev = firstValue ?? previousValue
    const current = secondValue ?? parseFloat(display)
    const op = operation ?? (operation as string)

    if (prev !== null && op) {
      const expression = `${prev} ${op} ${current}`
      let result = 0

      switch (op) {
        case '+': result = prev + current; break
        case '-': result = prev - current; break
        case '×': result = prev * current; break
        case '÷': result = current !== 0 ? prev / current : 0; break
        default: return current
      }

      const resultString = `${parseFloat(result.toFixed(7))}`
      setHistory(prev => [{ expression, result: resultString }, ...prev.slice(0, 4)])
      setDisplay(resultString)
      setPreviousValue(null)
      setOperation(null)
      setWaitingForOperand(true)

      return result
    }

    return current
  }

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <div className="max-w-sm mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 transition-colors duration-300">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calculator</h1>
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>

          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg min-h-[60px] flex items-center justify-end">
            <div className="text-right text-3xl font-mono text-gray-900 dark:text-white overflow-hidden">
              {display}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-4">
            <button onClick={clear} className="calc-button-clear col-span-2">AC</button>
            <button onClick={() => performOperation('÷')} className="calc-button-operator">÷</button>
            <button onClick={() => performOperation('×')} className="calc-button-operator">×</button>

            <button onClick={() => inputDigit(7)} className="calc-button-number">7</button>
            <button onClick={() => inputDigit(8)} className="calc-button-number">8</button>
            <button onClick={() => inputDigit(9)} className="calc-button-number">9</button>
            <button onClick={() => performOperation('-')} className="calc-button-operator">−</button>

            <button onClick={() => inputDigit(4)} className="calc-button-number">4</button>
            <button onClick={() => inputDigit(5)} className="calc-button-number">5</button>
            <button onClick={() => inputDigit(6)} className="calc-button-number">6</button>
            <button onClick={() => performOperation('+')} className="calc-button-operator">+</button>

            <button onClick={() => inputDigit(1)} className="calc-button-number">1</button>
            <button onClick={() => inputDigit(2)} className="calc-button-number">2</button>
            <button onClick={() => inputDigit(3)} className="calc-button-number">3</button>
            <button onClick={() => calculate()} className="calc-button-operator row-span-2">=</button>

            <button onClick={() => inputDigit(0)} className="calc-button-number col-span-2">0</button>
            <button onClick={inputDecimal} className="calc-button-number">.</button>
          </div>

          {history.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">History</h3>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {history.map((item, index) => (
                  <div key={index} className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    <div>{item.expression} = {item.result}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}