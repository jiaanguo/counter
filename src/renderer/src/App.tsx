import React, { useState, useEffect } from 'react'
import * as Papa from 'papaparse'

const App: React.FC = () => {
  const [countUp, setCountUp] = useState(0)
  const [countDown, setCountDown] = useState(0)
  const [trueUp, setTrueUp] = useState(0)
  const [trueDown, setTrueDown] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [decisionHistory, setDecisionHistory] = useState<string[]>([])
  const [trueHistory, setTrueHistory] = useState<string[]>([])
  const [historyLimit, setHistoryLimit] = useState<number | null>(null)

  const [currentState, setCurrentState] = useState<[number, number]>([0, 0])
  // const [previousState, setPreviousState] = useState<[number, number]>([0, 0])
  const [numberOfStates, setNumberOfStates] = useState<number>(0)
  const [transitionProbabilities, setTransitionProbabilities] = useState<number[][]>([])
  const [isLimitedRandom, setIsLimitedRandom] = useState<boolean>(false)
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(false)
  const [mostLikely, setMostLikely] = useState<[number, number, string, string][]>()
  const [score, setScore] = useState<number>(0)

  // useEffect with an empty dependency array to ensure it runs only once when the component mounts
  useEffect(() => {
    init()
  }, [])

  const init = (): void => {
    const min = 2
    const max = 4
    const randomValue = Math.random() * (max - min + 1) + min
    const numberOfStates = Math.floor(randomValue)
    setNumberOfStates(numberOfStates)
    console.log('NumStates: ' + numberOfStates)

    const transitionProbabilities: number[][] = Array.from(
      { length: 2 ** (numberOfStates - 1) },
      () => Array.from({ length: numberOfStates }, () => 0.0)
    )

    // let transitionProbabilitiesEG = [
    //   [0.2, 0.5, 0.3],
    //   [0.0, 0.0, 0.4],
    //   [0.0, 0.7, 0.2],
    //   [0.0, 0.0, 0.1]
    // ]

    genNumber(0, 0, transitionProbabilities, numberOfStates)
    setTransitionProbabilities(transitionProbabilities)
    console.log('TransitionProbabilities: ', transitionProbabilities)

    const currentState: [number, number] = [0, 0]
    let nextState: [number, number, string, string] = [0, 0, '上升', '0.0']
    const mostLikely: [number, number, string, string][] = []
    for (let i = 0; i < numberOfStates; i++) {
      nextState = getMostLikelyNextState(currentState, transitionProbabilities)
      currentState[0] = nextState[0]
      currentState[1] = nextState[1]
      mostLikely.push(nextState)
      console.log(nextState[2], nextState[3])
    }
    setMostLikely(mostLikely)
  }

  const genNumber = (
    posX: number,
    posY: number,
    transitionProbabilities: number[][],
    numberOfStates: number
  ): void => {
    if (posY === numberOfStates) {
      return
    }

    let randomNumber = Math.random()
    if (isLimitedRandom) {
      // between 0.0 and 0.3
      const min = 0.0
      const max = 0.3
      const limitedRandomNumber = randomNumber * (max - min) + min
      randomNumber = randomNumber >= 0.5 ? limitedRandomNumber : 1 - limitedRandomNumber
    }

    transitionProbabilities[posX][posY] = Number(randomNumber.toFixed(2))
    genNumber(posX, posY + 1, transitionProbabilities, numberOfStates)
    const stride = 2 ** (numberOfStates - posY - 2)
    genNumber(posX + stride, posY + 1, transitionProbabilities, numberOfStates)
  }

  const getNextState = (
    currentState: [number, number],
    transitionProbabilities: number[][]
  ): [number, number, string] => {
    const decision = Math.random()
    const length = transitionProbabilities[0].length
    if (decision < transitionProbabilities[currentState[0]][currentState[1]]) {
      if (currentState[1] + 1 === length) {
        return [0, 0, '上升']
      } else {
        return [currentState[0], currentState[1] + 1, '上升']
      }
    } else {
      const stride = 2 ** (length - currentState[1] - 2)
      if (currentState[1] + 1 === length) {
        return [0, 0, '下降']
      } else {
        return [currentState[0] + stride, currentState[1] + 1, '下降']
      }
    }
  }

  const getMostLikelyNextState = (
    currentState: [number, number],
    transitionProbabilities: number[][]
  ): [number, number, string, string] => {
    const length = transitionProbabilities[0].length
    if (transitionProbabilities[currentState[0]][currentState[1]] >= 0.5) {
      if (currentState[1] + 1 === length) {
        return [0, 0, '上升', transitionProbabilities[currentState[0]][currentState[1]].toFixed(2)]
      } else {
        return [
          currentState[0],
          currentState[1] + 1,
          '上升',
          transitionProbabilities[currentState[0]][currentState[1]].toFixed(2)
        ]
      }
    } else {
      const stride = 2 ** (length - currentState[1] - 2)
      if (currentState[1] + 1 === length) {
        return [
          0,
          0,
          '下降',
          (1 - transitionProbabilities[currentState[0]][currentState[1]]).toFixed(2)
        ]
      } else {
        return [
          currentState[0] + stride,
          currentState[1] + 1,
          '下降',
          (1 - transitionProbabilities[currentState[0]][currentState[1]]).toFixed(2)
        ]
      }
    }
  }

  const handleCountUp = (): void => {
    setCountUp(countUp + 1)
    setTotalCount(totalCount + 1)
    setDecisionHistory(['上升', ...decisionHistory])
    const nextState = getNextState(currentState, transitionProbabilities)
    // setPreviousState(currentState)
    setCurrentState([nextState[0], nextState[1]])
    setTrueHistory([nextState[2], ...trueHistory])

    if (nextState[2] === '上升') {
      setTrueUp(trueUp + 1)
    } else {
      setTrueDown(trueDown + 1)
    }

    if (nextState[2] === '上升') {
      setScore(score + 5)
    } else {
      setScore(score - 5)
    }
    // console.log(nextState[0], nextState[1], nextState[2]);
  }

  const handleCountDown = (): void => {
    setCountDown(countDown + 1)
    setTotalCount(totalCount + 1)
    setDecisionHistory(['下降', ...decisionHistory])

    const nextState = getNextState(currentState, transitionProbabilities)
    // setPreviousState(currentState)
    setCurrentState([nextState[0], nextState[1]])
    setTrueHistory([nextState[2], ...trueHistory])

    if (nextState[2] === '上升') {
      setTrueUp(trueUp + 1)
    } else {
      setTrueDown(trueDown + 1)
    }

    if (nextState[2] === '下降') {
      setScore(score + 5)
    } else {
      setScore(score - 5)
    }
  }

  const calculatePercentage = (count: number): string => {
    const percentage = totalCount === 0 ? 0 : (count / totalCount) * 100
    return percentage.toFixed(2) + '%'
  }

  // const calculateViewPercentage = (count: number, up: boolean): string => {
  //   if (historyLimit === null) {
  //     const percentage = totalCount === 0 ? 0 : (count / totalCount) * 100
  //     return percentage.toFixed(2) + '%'
  //   } else {
  //     const total = Math.min(totalCount, historyLimit)
  //     let countUp = 0
  //     let countDown = 0
  //     for (let i = 0; i < total; i++) {
  //       if (decisionHistory[i] === '上升') {
  //         countUp += 1
  //       } else {
  //         countDown += 1
  //       }
  //     }
  //     if (up) {
  //       const percentage = total === 0 ? 0 : (countUp / total) * 100
  //       return percentage.toFixed(2) + '%'
  //     } else {
  //       const percentage = total === 0 ? 0 : (countDown / total) * 100
  //       return percentage.toFixed(2) + '%'
  //     }
  //   }
  // }

  const exportToCSV = (): void => {
    const csv = Papa.unparse({
      fields: ['决策', '真实', '对错'],
      data: decisionHistory.map((decision, index) => [
        decision,
        trueHistory[index],
        decision === trueHistory[index] ? '✅' : '❌'
      ])
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

  // DEPRECATED
  // const exportViewToCSV = (): void => {
  //   const csv = Papa.unparse({
  //     fields: ['决策历史'],
  //     data: decisionHistory
  //       .slice(0, historyLimit === null ? decisionHistory.length : historyLimit)
  //       .map((decision) => [decision])
  //   })

  //   const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  //   const link = document.createElement('a')

  //   if (link.download !== undefined) {
  //     const url = URL.createObjectURL(blob)
  //     link.setAttribute('href', url)
  //     link.setAttribute('download', '决策历史.csv')
  //     document.body.appendChild(link)
  //     link.click()
  //     document.body.removeChild(link)
  //   } else {
  //     alert('Your browser does not support the download feature. Please try another browser.')
  //   }
  // }

  // TODO： 撤销多次历史
  // const revokeHistory = (): void => {
  //   if (decisionHistory.length === 0) {
  //     return
  //   }

  //   const last = decisionHistory[0]
  //   setDecisionHistory(decisionHistory.slice(1, decisionHistory.length))
  //   if (last === '上升') {
  //     setCountUp(countUp - 1)
  //   } else {
  //     setCountDown(countDown - 1)
  //   }

  //   const trueLast = trueHistory[0]
  //   setTrueHistory(trueHistory.slice(1, trueHistory.length))
  //   if (trueLast === '上升') {
  //     setTrueUp(trueUp - 1)
  //   } else {
  //     setTrueDown(trueDown - 1)
  //   }

  //   // TODO： 撤销多次历史,score
  //   // setPreviousState(...);
  //   setCurrentState(previousState)

  //   setTotalCount(totalCount - 1)
  // }

  const clearHistory = (): void => {
    setDecisionHistory([])
    setTrueHistory([])
    setCountUp(0)
    setCountDown(0)
    setTrueUp(0)
    setTrueDown(0)
    setTotalCount(0)
    setCurrentState([0, 0])
    setScore(0)
  }

  return (
    <div className="app-container">
      <div className="counter-container">
        <h1>真实上升:</h1>
        <div className="counter">
          <span>{trueUp}</span>
          <p>真实上升占比: {calculatePercentage(trueUp)}</p>
        </div>
        <div>
          <button onClick={handleCountUp}>上升</button>
        </div>
        <div>
          <button onClick={init}>初始化</button>
          <div className="decision-options">
            <label>
              LimitedRandom( gt 0.7 ):
              <input
                type="checkbox"
                checked={isLimitedRandom}
                onChange={() => setIsLimitedRandom(!isLimitedRandom)}
              />
            </label>
          </div>

          {/* <button onClick={revokeHistory}>撤销</button> */}
        </div>
      </div>

      <div className="counter-container">
        <h1>真实下降:</h1>
        <div className="counter">
          <span>{trueDown}</span>
          <p>真实下降占比: {calculatePercentage(trueDown)}</p>
        </div>
        <div>
          <button onClick={handleCountDown}>下降</button>
        </div>
        <div>
          <button onClick={clearHistory}>清除</button>
        </div>
      </div>

      <div className="decision-history">
        <h2>决策历史: {score}</h2>
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
              <li className="header">决策 真实 对错</li>
              {decisionHistory
                // .slice(0, historyLimit === null ? decisionHistory.length : historyLimit)
                .map((decision, index) => (
                  <div className="decision-history-limit" key={index}>
                    <li
                      hidden={
                        historyLimit === null
                          ? true
                          : index % historyLimit === decisionHistory.length % historyLimit
                            ? false
                            : true
                      }
                      key={index}
                    >
                      {' -- '}
                      {historyLimit === null ? 0 : (decisionHistory.length - index) / historyLimit}
                    </li>
                    <li key={index}>
                      {decision} {trueHistory[index]}{' '}
                      {decision === trueHistory[index] ? '✅' : '❌'}
                    </li>
                  </div>
                ))}
            </ul>
          </div>
        </div>
        {/* <p>窗口上升占比: {calculateViewPercentage(trueUp, true)}</p> */}
        {/* <p>窗口下降占比: {calculateViewPercentage(trueDown, false)}</p> */}
        <button onClick={exportToCSV}>输出决策历史</button>
        <button onClick={() => setIsSidebarVisible(!isSidebarVisible)}>来骗！来偷袭！</button>

        {/* <button onClick={exportViewToCSV}>输出决策窗口</button> */}
      </div>
      <div className={`app-container ${isSidebarVisible ? '' : 'sidebar-hidden'}`}>
        <div className="sidebar">
          <ul>
            <li>
              {'NumStates: '}
              {numberOfStates}
            </li>
            {/* <li>"TransitionProbabilities: " {transitionProbabilities}</li> */}
            {mostLikely !== undefined
              ? mostLikely.map((item, index) => (
                  <li key={index}>
                    {item[2]}, {item[3]}
                  </li>
                ))
              : null}
          </ul>
        </div>
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
