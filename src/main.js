import React from 'react'
import { createRoot } from 'react-dom/client'
import BetterTable from './BetterTable'
import { Button } from '@mui/material'

let fieldList;
let subTableList;

const handleContent = content => {
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
    { title: '', field: '' },
    { title: 'label', field: 'label' },
    { title: 'type', field: 'type' },
    { title: 'var', field: 'var' },
  ]
  const [rows, setRows] = React.useState(props.rows)
  const [fieldList, setFieldList] = React.useState(props.rows);
  const [subTables, setSubTables] = React.useState(props.subTables);

  React.useEffect(() => {
    if (fieldList && subTables) {
      const _rows = fieldList.concat(subTables);
      setRows(_rows);
    }

  }, [fieldList, subTables]);


  const handleUpdate = () => {
    // 基本的なフィールドセット
    chrome.devtools.inspectedWindow.eval(
      "cybozu.data.page.FORM_DATA.schema.table.fieldList",
      function (result, isException) {
        if (isException) {
          console.error(isException);
        } else {
          const _fieldList = Object.keys(result).map(obj => result[obj]).filter(row => !['RECORD_ID', 'MODIFIER', 'CREATOR', 'MODIFIED_AT', 'CREATED_AT', 'STATUS', 'STATUS_ASSIGNEE', 'CATEGORY'].includes(row.type))
          // setRows(rows)
          setFieldList(_fieldList);
        }
      }
    )

    // サブテーブルとその中のフィールドセット
    chrome.devtools.inspectedWindow.eval(
      "cybozu.data.page.FORM_DATA.schema.subTable",
      function (result, isException) {
        if (isException) {
          console.error(isException);
        } else {
          const parseTableData = Object.keys(result).map(key => result[key]);
          setSubTables(parseTableData)
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
          console.log(result);
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

// kintoneアプリのフィールド情報取得
const getFieldList = () => {
  chrome.devtools.inspectedWindow.eval(
    "cybozu.data.page.FORM_DATA.schema.table.fieldList",
    function (result, isException) {
      if (isException) {
        console.error(isException);
      } else {
        const rows = Object.keys(result).map(obj => result[obj]).filter(row => !['RECORD_ID', 'MODIFIER', 'CREATOR', 'MODIFIED_AT', 'CREATED_AT', 'STATUS', 'STATUS_ASSIGNEE', 'CATEGORY'].includes(row.type))
        fieldList = rows;
      }
    }
  )
}

// kintoneアプリのサブテーブル情報取得
// またサブテーブル情報にはtypeがついていないので、こちらでつけることによってテーブル表示を行っている
const getSubTableList = () => {
  chrome.devtools.inspectedWindow.eval(
    "cybozu.data.page.FORM_DATA.schema.subTable",
    function (result, isException) {
      if (isException) {
        console.error(isException);
      } else {
        // const rows = Object.keys(result).map(obj => result[obj]).filter(row => !['RECORD_ID', 'MODIFIER', 'CREATOR', 'MODIFIED_AT', 'CREATED_AT', 'STATUS', 'STATUS_ASSIGNEE', 'CATEGORY'].includes(row.type))
        const parseTableData = Object.keys(result).map(key => {
          const tableData = result[key];
          tableData.type = 'SUBTABLE';
          return tableData;
        });
        subTableList = parseTableData;
      }
    }
  )
}

const render = () => {
  let interval = setInterval(() => {
    if (fieldList && subTableList) {
      const rootEl = document.getElementById('root');
      const root = createRoot(rootEl);
      root.render(<App rows={fieldList} subTables={subTableList} />)

      clearInterval(interval);
    }
  }, 200);
}



getFieldList()
getSubTableList()
render();
