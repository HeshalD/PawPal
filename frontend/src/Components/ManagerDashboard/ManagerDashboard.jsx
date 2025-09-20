import React, { useEffect, useState, useMemo } from 'react';
import { SponsorsAPI, toImageUrl } from '../../services/api';
import { Paper, Typography, Stack, Button, Box, Tab, Tabs } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

function GridSection({ rows, columns, title }) {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>{title}</Typography>
      <div style={{ height: 420, width: '100%' }}>
        <DataGrid rows={rows} columns={columns} pageSizeOptions={[5,10]} initialState={{ pagination: { paginationModel: { pageSize: 5 } } }} />
      </div>
    </Paper>
  );
}

export default function ManagerDashboard() {
  const [pending, setPending] = useState([]);
  const [active, setActive] = useState([]);
  const [past, setPast] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, a, pa, rj] = await Promise.all([
        SponsorsAPI.managerPending(),
        SponsorsAPI.managerActive(),
        SponsorsAPI.managerPast(),
        SponsorsAPI.byStatus('rejected'),
      ]);
      setPending(p.data.sponsors || []);
      setActive(a.data.sponsors || []);
      setPast(pa.data.sponsors || []);
      setRejected(rj.data.sponsors || []);
    } catch (e) {
      console.error('Manager load error:', e);
      setError(`Failed to load: ${e?.response?.data?.message || e.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    console.log('ManagerDashboard mounted, loading data...');
    load(); 
  }, []);

  const approve = async (id) => {
    try {
      await SponsorsAPI.approve(id);
      await load();
    } catch (e) {
      console.error('Approve error:', e);
      setError(`Approve failed: ${e?.response?.data?.message || e.message}`);
    }
  };
  const reject = async (id) => {
    try {
      await SponsorsAPI.reject(id);
      await load();
    } catch (e) {
      console.error('Reject error:', e);
      setError(`Reject failed: ${e?.response?.data?.message || e.message}`);
    }
  };
  const remove = async (id) => {
    try {
      await SponsorsAPI.remove(id);
      await load();
    } catch (e) {
      console.error('Remove error:', e);
      setError(`Remove failed: ${e?.response?.data?.message || e.message}`);
    }
  };

  const commonCols = useMemo(() => ([
  { field: 'sponsorName', headerName: 'Name', flex: 1 },
  { field: 'companyName', headerName: 'Company', flex: 1, valueGetter: (params) => params?.row?.companyName || '-' },
  { field: 'status', headerName: 'Status', width: 120 },
  { field: 'startDate', headerName: 'Start', width: 130, valueGetter: (params) => params?.row?.startDate ? new Date(params.row.startDate).toLocaleDateString() : '-' },
  { field: 'endDate', headerName: 'End', width: 130, valueGetter: (params) => params?.row?.endDate ? new Date(params.row.endDate).toLocaleDateString() : '-' },
  { field: 'ad', headerName: 'Ad', width: 140, renderCell: (params) => params?.row?.adImagePath ? (<img src={toImageUrl(params.row.adImagePath)} alt="ad" style={{ width: 120, height: 60, objectFit: 'cover', borderRadius: 6 }} />) : '-' },
  ]), []);

  const pendingCols = useMemo(() => ([
    ...commonCols,
    { field: 'actions', headerName: 'Actions', width: 260, renderCell: ({ row }) => (
      <Stack direction="row" spacing={1}>
        <Button size="small" variant="contained" onClick={() => approve(row?._id)}>Approve</Button>
        <Button size="small" color="warning" variant="outlined" onClick={() => reject(row?._id)}>Reject</Button>
        <Button size="small" color="error" variant="outlined" onClick={() => remove(row?._id)}>Delete</Button>
      </Stack>
    ) },
  ]), [approve, reject, remove]);

  const activeCols = useMemo(() => ([
    ...commonCols,
    { field: 'actions', headerName: 'Actions', width: 160, renderCell: ({ row }) => (
      <Button size="small" color="error" variant="outlined" onClick={() => remove(row?._id)}>Delete</Button>
    ) },
  ]), [remove]);

  const pastCols = useMemo(() => ([
    ...commonCols,
    { field: 'actions', headerName: 'Actions', width: 120, renderCell: () => (<Typography variant="body2" color="text.secondary">Locked</Typography>) },
  ]), []);

  const rejectedCols = useMemo(() => ([
    ...commonCols,
    { field: 'actions', headerName: 'Actions', width: 120, renderCell: () => (<Typography variant="body2" color="error">Rejected</Typography>) },
  ]), []);

  const withId = (arr) => (arr || []).map((x) => ({ id: x._id, ...x }));

  if (loading) {
    return (
      <Stack spacing={3}>
        <Typography variant="h5">Manager Dashboard</Typography>
        <Typography>Loading...</Typography>
        <Typography variant="body2" color="text.secondary">Check browser console for errors</Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Manager Dashboard</Typography>
      {error && <Typography color="error">{error}</Typography>}

      <GridSection title="Pending" rows={withId(pending)} columns={pendingCols} />
      <GridSection title="Active" rows={withId(active)} columns={activeCols} />
      <GridSection title="Past" rows={withId(past)} columns={pastCols} />
      <GridSection title="Rejected Ads" rows={withId(rejected)} columns={rejectedCols} />
    </Stack>
  );
}


