import React from 'react';
import { styled } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
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

const BetterTable = props => {
  const { rows, columns } = props;
  const [filter, setFilter] = React.useState('');
  const [filtered, setFiltered] = React.useState(rows);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(100);

  React.useEffect(() => {
    setFiltered(
      rows.filter(
        row => JSON.stringify(Object.values(row)).indexOf(filter) != -1
      )
    );
    setPage(0);
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
                <StyledTableCell key={index}>{column.title}</StyledTableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) =>
              <StyledTableRow key={index}>
                {columns.map((column, i) =>
                  <StyledTableCell key={i}>{row[column.field]}</StyledTableCell>
                )}
              </StyledTableRow>
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
export default BetterTable;