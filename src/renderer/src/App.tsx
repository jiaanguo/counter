import React, { useState } from 'react'
import * as Papa from 'papaparse'

const App: React.FC = () => {
  const [countUp, setCountUp] = useState(0)
  const [countDown, setCountDown] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [decisionHistory, setDecisionHistory] = useState<string[]>([])
  const [historyLimit, setHistoryLimit] = useState<number | null>(null)

  const handleCountUp = () => {
    setCountUp(countUp + 1)
    setTotalCount(totalCount + 1)
    setDecisionHistory(['上升', ...decisionHistory])
  }

  const handleCountDown = () => {
    setCountDown(countDown + 1)
    setTotalCount(totalCount + 1)
    setDecisionHistory(['下降', ...decisionHistory])
  }

  const calculatePercentage = (count: number): string => {
    const percentage = totalCount === 0 ? 0 : (count / totalCount) * 100
    return percentage.toFixed(2) + '%'
  }

  const calculateViewPercentage = (count: number, up: boolean): string => {
    if (historyLimit === null) {
      const percentage = totalCount === 0 ? 0 : (count / totalCount) * 100
      return percentage.toFixed(2) + '%'
    } else {
      const total = Math.min(totalCount, historyLimit)
      let countUp = 0
      let countDown = 0
      for (let i = 0; i < total; i++) {
        if (decisionHistory[i] === '上升') {
          countUp += 1
        } else {
          countDown += 1
        }
      }
      if (up) {
        const percentage = total === 0 ? 0 : (countUp / total) * 100
        return percentage.toFixed(2) + '%'
      } else {
        const percentage = total === 0 ? 0 : (countDown / total) * 100
        return percentage.toFixed(2) + '%'
      }
    }
  }

  const exportToCSV = () => {
    const csv = Papa.unparse({
      fields: ['决策历史'],
      data: decisionHistory.map((decision) => [decision])
    })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', '决策历史.csv')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      alert('Your browser does not support the download feature. Please try another browser.')
    }
  }

  const exportViewToCSV = () => {
    const csv = Papa.unparse({
      fields: ['决策历史'],
      data: decisionHistory
        .slice(0, historyLimit === null ? decisionHistory.length : historyLimit)
        .map((decision) => [decision])
    })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', '决策历史.csv')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      alert('Your browser does not support the download feature. Please try another browser.')
    }
  }

  const revokeHistory = () => {
    if (decisionHistory.length === 0) {
      return
    }

    const last = decisionHistory[0]
    setDecisionHistory(decisionHistory.slice(1, decisionHistory.length))
    if (last === '上升') {
      setCountUp(countUp - 1)
    } else {
      setCountDown(countDown - 1)
    }
    setTotalCount(totalCount - 1)
  }

  const clearHistory = () => {
    setDecisionHistory([])
    setCountUp(0)
    setCountDown(0)
    setTotalCount(0)
  }

  return (
    <div className="app-container">
      <div className="counter-container">
        <h1>上升:</h1>
        <div className="counter">
          <span>{countUp}</span>
          <p>历史上升占比: {calculatePercentage(countUp)}</p>
        </div>
        <div>
          <button onClick={handleCountUp}>上升</button>
        </div>
        <div>
          <button onClick={revokeHistory}>撤销</button>
        </div>
      </div>

      <div className="counter-container">
        <h1>下降:</h1>
        <div className="counter">
          <span>{countDown}</span>
          <p>历史下降占比: {calculatePercentage(countDown)}</p>
        </div>
        <div>
          <button onClick={handleCountDown}>下降</button>
        </div>
        <div>
          <button onClick={clearHistory}>清除</button>
        </div>
      </div>

      <div className="decision-history">
        <h2>决策历史:</h2>
        <label htmlFor="history-limit">决策窗口上限:</label>
        <input
          type="number"
          id="history-limit"
          value={historyLimit || ''}
          onChange={(e) => {
            const historyLimit = e.target.value !== '' ? parseInt(e.target.value, 10) : null
            setHistoryLimit(historyLimit)
          }}
        />
        <div className="decision-history-container">
          <div className="decision-history-list">
            <ul>
              {decisionHistory
                .slice(0, historyLimit === null ? decisionHistory.length : historyLimit)
                .map((decision, index) => (
                  <li key={index}>{decision}</li>
                ))}
            </ul>
          </div>
        </div>
        <p>窗口上升占比: {calculateViewPercentage(countUp, true)}</p>
        <p>窗口下降占比: {calculateViewPercentage(countDown, false)}</p>
        <button onClick={exportToCSV}>输出决策历史</button>
        <button onClick={exportViewToCSV}>输出决策窗口</button>
      </div>
    </div>
  )
}

// function App(): JSX.Element {
//   return (
//     <div className="container">
//       <Versions></Versions>

//       <svg className="hero-logo" viewBox="0 0 900 300">
//         <use xlinkHref={`${icons}#electron`} />
//       </svg>
//       <h2 className="hero-text">
//         You{"'"}ve successfully created an Electron project with React and TypeScript, Wow
//       </h2>
//       <p className="hero-tagline">
//         Please try pressing <code>F12</code> to open the devTool
//       </p>

//       <div className="links">
//         <div className="link-item">
//           <a target="_blank" href="https://electron-vite.org" rel="noopener noreferrer">
//             Documentation
//           </a>
//         </div>
//         <div className="link-item link-dot">•</div>
//         <div className="link-item">
//           <a
//             target="_blank"
//             href="https://github.com/alex8088/electron-vite"
//             rel="noopener noreferrer"
//           >
//             Getting Help
//           </a>
//         </div>
//         <div className="link-item link-dot">•</div>
//         <div className="link-item">
//           <a
//             target="_blank"
//             href="https://github.com/alex8088/quick-start/tree/master/packages/create-electron"
//             rel="noopener noreferrer"
//           >
//             create-electron
//           </a>
//         </div>
//       </div>

//       <div className="features">
//         <div className="feature-item">
//           <article>
//             <h2 className="title">Configuring</h2>
//             <p className="detail">
//               Config with <span>electron.vite.config.ts</span> and refer to the{' '}
//               <a target="_blank" href="https://electron-vite.org/config" rel="noopener noreferrer">
//                 config guide
//               </a>
//               .
//             </p>
//           </article>
//         </div>
//         <div className="feature-item">
//           <article>
//             <h2 className="title">HMR</h2>
//             <p className="detail">
//               Edit <span>src/renderer</span> files to test HMR. See{' '}
//               <a
//                 target="_blank"
//                 href="https://electron-vite.org/guide/hmr.html"
//                 rel="noopener noreferrer"
//               >
//                 docs
//               </a>
//               .
//             </p>
//           </article>
//         </div>
//         <div className="feature-item">
//           <article>
//             <h2 className="title">Hot Reloading</h2>
//             <p className="detail">
//               Run{' '}
//               <span>
//                 {"'"}electron-vite dev --watch{"'"}
//               </span>{' '}
//               to enable. See{' '}
//               <a
//                 target="_blank"
//                 href="https://electron-vite.org/guide/hot-reloading.html"
//                 rel="noopener noreferrer"
//               >
//                 docs
//               </a>
//               .
//             </p>
//           </article>
//         </div>
//         <div className="feature-item">
//           <article>
//             <h2 className="title">Debugging</h2>
//             <p className="detail">
//               Check out <span>.vscode/launch.json</span>. See{' '}
//               <a
//                 target="_blank"
//                 href="https://electron-vite.org/guide/debugging.html"
//                 rel="noopener noreferrer"
//               >
//                 docs
//               </a>
//               .
//             </p>
//           </article>
//         </div>
//         <div className="feature-item">
//           <article>
//             <h2 className="title">Source Code Protection</h2>
//             <p className="detail">
//               Supported via built-in plugin <span>bytecodePlugin</span>. See{' '}
//               <a
//                 target="_blank"
//                 href="https://electron-vite.org/guide/source-code-protection.html"
//                 rel="noopener noreferrer"
//               >
//                 docs
//               </a>
//               .
//             </p>
//           </article>
//         </div>
//         <div className="feature-item">
//           <article>
//             <h2 className="title">Packaging</h2>
//             <p className="detail">
//               Use{' '}
//               <a target="_blank" href="https://www.electron.build" rel="noopener noreferrer">
//                 electron-builder
//               </a>{' '}
//               and pre-configured to pack your app.
//             </p>
//           </article>
//         </div>
//       </div>
//     </div>
//   )
// }

export default App
