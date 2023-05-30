import React from 'react'
import { createRoot } from 'react-dom/client'
import BetterTable from './BetterTable'
import { Button } from '@mui/material'

const handleContent = content => {
  console.log(content)
  const blob = new Blob([JSON.stringify(JSON.parse(content), null, 2)], { type: 'application\/json' })
  chrome.downloads.download({ url: URL.createObjectURL(blob) })
}

chrome.devtools.network.onRequestFinished.addListener((req) => {
  const url = req.request.url;
  if (url.indexOf("cybozu.com/k/v1/app/form/fields.json") !== -1) {
    req.getContent(handleContent)
  }
})

const App = props => {
  const columns = [
    { title: 'label', field: 'label' },
    { title: 'type', field: 'type' },
    { title: 'var', field: 'var' },
  ]
  const [rows, setRows] = React.useState(props.rows)
  const handleUpdate = () => {
    chrome.devtools.inspectedWindow.eval(
      "cybozu.data.page.FORM_DATA.schema.table.fieldList",
      function (result, isException) {
        if (isException) {
          console.error(isException);
        } else {
          const rows = Object.keys(result).map(obj => result[obj]).filter(row => !['RECORD_ID', 'MODIFIER', 'CREATOR', 'MODIFIED_AT', 'CREATED_AT', 'STATUS', 'STATUS_ASSIGNEE', 'CATEGORY'].includes(row.type))
          setRows(rows)
        }
      }
    )
  }
  const handleDownload = () => {
    chrome.devtools.inspectedWindow.eval(
      "kintone.app.record.get()",
      function (result, isException) {
        if (isException) {
          console.error(isException);
        } else {
          const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application\/json' })
          chrome.downloads.download({ url: URL.createObjectURL(blob) })
        }
      }
    )
  }
  const handleUpload = () => {
    fileRef.current.click()
  }
  const handleFileChange = (event) => {
    const files = event.currentTarget.files
    if (!files || files?.length === 0) return
    const file = files[0]
    const reader = new FileReader()
    reader.addEventListener("load", () => {
      chrome.devtools.inspectedWindow.eval(
        `kintone.app.record.set(JSON.parse(${JSON.stringify(reader.result)}))`,
        function (result, isException) {
          if (isException) {
            console.error(isException);
          } else {
            console.log(result)
          }
        }
      )
    })
    reader.readAsText(file, 'UTF-8')
  }
  const handleFieldsDownload = () => {
    chrome.devtools.inspectedWindow.eval(
      'kintone.app.getId()',
      function (result, isException) {
        if (isException) {
          console.error(isException);
        } else {
          chrome.devtools.inspectedWindow.eval(
            `kintone.api('/k/v1/app/form/fields.json', 'GET', {app: ${result}})`,
            function (result, isException) {
              if (isException) {
                console.error(isException);
              } else {
                console.log(result)
              }
            }
          )
        }
      }
    )
  }
  const fileRef = React.useRef()
  return (
    <>
      <Button onClick={handleUpdate}>手動更新</Button>
      <Button onClick={handleDownload}>レコード出力</Button>
      <Button onClick={handleUpload}>レコード入力(SET)</Button>
      <Button disabled>レコード入力(POST)</Button>
      <Button onClick={handleFieldsDownload}>フィールド出力</Button>
      <input type='file' accept='.json' onChange={handleFileChange} style={{ display: 'none' }} ref={fileRef} />
      <BetterTable columns={columns} rows={rows} />
    </>
  )
}

const render = () => {
  chrome.devtools.inspectedWindow.eval(
    "cybozu.data.page.FORM_DATA.schema.table.fieldList",
    function (result, isException) {
      if (isException) {
        console.error(isException);
      } else {
        const rows = Object.keys(result).map(obj => result[obj]).filter(row => !['RECORD_ID', 'MODIFIER', 'CREATOR', 'MODIFIED_AT', 'CREATED_AT', 'STATUS', 'STATUS_ASSIGNEE', 'CATEGORY'].includes(row.type))
        const rootEl = document.getElementById('root')
        const root = createRoot(rootEl)
        root.render(<App rows={rows} />)
      }
    }
  )
}
render()
