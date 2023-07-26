import React from 'react';
import { styled } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Collapse from "@mui/material/Collapse";
import Box from '@mui/material/Box';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TablePagination from '@mui/material/TablePagination';


const StyledTableRow = styled(TableRow)(() => ({
  '&:nth-of-type(even)': {
    backgroundColor: '#f5f5f5',
  },
  '&:last-child th': {
    borderBottom: 0,
  },
}));

const StyledTableCell = styled(TableCell)(() => ({
  borderRight: '1px solid #d4d7d7',
  '&:last-child': {
    borderRight: 0,
  },
  [`&.${tableCellClasses.head}`]: {
    borderBottom: '3px solid #d4d7d7',
  },
}));


const subtableColumns = [
  { title: 'label', field: 'label' },
  { title: 'type', field: 'type' },
  { title: 'var', field: 'var' },
]


const BetterTable = props => {
  console.log(props);
  const { rows, columns } = props;
  const [filter, setFilter] = React.useState('');
  const [filtered, setFiltered] = React.useState(rows);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(100);

  React.useEffect(() => {
    if (rows.length > 0) {
      setFiltered(
        rows.filter(
          row => JSON.stringify(Object.values(row)).indexOf(filter) != -1
        )
      );
      setPage(0);
    }

  }, [rows]);

  React.useEffect(() => {
    setFiltered(
      rows.filter(
        row => JSON.stringify(Object.values(row)).indexOf(filter) != -1
      )
    );
    setPage(0);
  }, [filter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      <Toolbar>
        <TextField
          sx={{ m: '0 0 0 auto', pr: '10px', minWidth: 150 }}
          variant="standard"
          value={filter}
          placeholder="検索"
          onChange={(e) => setFilter(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Tooltip title={''}>
                  <SearchIcon fontSize="small" />
                </Tooltip>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton disabled={!filter} onClick={() => setFilter('')}>
                  <HighlightOffIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <Typography sx={{ width: '120px', fontSize: '14px', textAlign: 'right' }}>{`${filtered.length} / ${rows.length}件`}</Typography>
      </Toolbar>
      <TableContainer sx={{ backgroundColor: 'white', border: '1px solid #d4d7d7' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column, index) =>
                <StyledTableCell key={`column-${index}`}>{column.title}</StyledTableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) =>
              // <StyledTableRow key={index}>
              //   {columns.map((column, i) =>
              //     <StyledTableCell key={i}>{row[column.field]}</StyledTableCell>
              //   )}
              // </StyledTableRow>
              <Row key={index} rowData={row} columns={columns} />
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 50, 100]}
        component="div"
        count={filtered.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        labelRowsPerPage="ページあたりの行数"
      />
    </>
  );
}


const Row = (props) => {
  const { rowData, columns } = props;
  const [open, setOpen] = React.useState(false);




  /**
   * 描画
   */




  /**
   * 各行の描画
   */
  const rows = React.useMemo(() => {
    if (rowData) {
      // フィールド情報を載せる
      // サブテーブルの場合、最初の空カラムにはアイコンボタン表示
      const dataCells = columns.map((column, index) => {
        const cellData = rowData.fieldList && !column.field ?
          <IconButton
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton> : rowData[column.field]

        const cell = <StyledTableCell key={`${rowData.id}-cell-${index}`}>{cellData}</StyledTableCell>
        return cell;
      })

      // サブテーブルのデータ（サブテーブルであれば）
      const subTableRows = rowData.fieldList ?
        <StyledTableRow key={`subtable-${rowData.id}`}>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={columns.length}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Typography variant="v6" gutterBottom component="div">サブテーブル</Typography>
                <TableContainer sx={{ backgroundColor: 'white', border: '1px solid #d4d7d7' }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        {subtableColumns.map((column, columnIndex) =>
                          <StyledTableCell key={`${rowData.id}-colum-${columnIndex}`}>{column.title}</StyledTableCell>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.keys(rowData.fieldList).map((fieldListKey, fieldListIndex) =>
                        <StyledTableRow key={`${rowData.fieldList[fieldListKey]}-row-${fieldListIndex}`}>
                          {subtableColumns.map((subTableColumn, subTableColumnIndex) =>
                            <StyledTableCell key={`${rowData.fieldList[fieldListKey]}-row-${fieldListIndex}-cell${subTableColumnIndex}`}>{rowData.fieldList[fieldListKey][subTableColumn.field]}</StyledTableCell>
                          )}
                        </StyledTableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Collapse>
          </TableCell>
        </StyledTableRow> : null

      return (
        <>
          <StyledTableRow key={rowData.id}>
            {dataCells}
          </StyledTableRow>
          {subTableRows}
        </>
      )
    }
  }, [rowData, columns, open])


  return (
    <>
      {rows}
    </>
  )
}

export default BetterTable;