import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { SponsorsAPI, toImageUrl } from '../../services/api';
import { Box, TextField, MenuItem, Button, Alert, Paper, Typography, Stack, Container } from '@mui/material';

const validationSchema = Yup.object({
  sponsorName: Yup.string().required('Required'),
  companyName: Yup.string().nullable(),
  email: Yup.string().email('Invalid email').required('Required'),
  phone: Yup.string().required('Required'),
  address: Yup.string().nullable(),
  durationMonths: Yup.number().oneOf([3,6,9,12,0.001], 'Invalid duration').required('Required'),
  adImage: Yup.mixed().nullable(),
});

export default function SponsorForm() {
  const [submitted, setSubmitted] = useState(null);
  const [error, setError] = useState(null);

  const formik = useFormik({
    initialValues: {
      sponsorName: '',
      companyName: '',
      email: '',
      phone: '',
      address: '',
      durationMonths: 3,
      adImage: null,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setError(null);
      try {
        const fd = new FormData();
        fd.append('sponsorName', values.sponsorName);
        if (values.companyName) fd.append('companyName', values.companyName);
        fd.append('email', values.email);
        fd.append('phone', values.phone);
        if (values.address) fd.append('address', values.address);
        fd.append('durationMonths', String(values.durationMonths));
        if (values.adImage) fd.append('adImage', values.adImage);

        const { data } = await SponsorsAPI.create(fd);
        setSubmitted(data.sponsor);
        resetForm();
      } catch (e) {
        setError(e?.response?.data?.message || 'Submit failed');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Become a Sponsor</Typography>
        <Box component="form" onSubmit={formik.handleSubmit} noValidate>
          <Stack spacing={2}>
            <TextField label="Name" name="sponsorName" value={formik.values.sponsorName} onChange={formik.handleChange} error={formik.touched.sponsorName && Boolean(formik.errors.sponsorName)} helperText={formik.touched.sponsorName && formik.errors.sponsorName} fullWidth />
            <TextField label="Company (optional)" name="companyName" value={formik.values.companyName} onChange={formik.handleChange} fullWidth />
            <TextField label="Email" name="email" type="email" value={formik.values.email} onChange={formik.handleChange} error={formik.touched.email && Boolean(formik.errors.email)} helperText={formik.touched.email && formik.errors.email} fullWidth />
            <TextField label="Phone" name="phone" value={formik.values.phone} onChange={formik.handleChange} error={formik.touched.phone && Boolean(formik.errors.phone)} helperText={formik.touched.phone && formik.errors.phone} fullWidth />
            <TextField label="Address (optional)" name="address" value={formik.values.address} onChange={formik.handleChange} fullWidth />
            <TextField select label="Duration" name="durationMonths" value={formik.values.durationMonths} onChange={formik.handleChange} error={formik.touched.durationMonths && Boolean(formik.errors.durationMonths)} helperText={formik.touched.durationMonths && formik.errors.durationMonths} fullWidth>
              <MenuItem value={3}>3 months</MenuItem>
              <MenuItem value={6}>6 months</MenuItem>
              <MenuItem value={9}>9 months</MenuItem>
              <MenuItem value={12}>12 months</MenuItem>
              <MenuItem value={0.001}>1 minute (for testing)</MenuItem>
            </TextField>
            <Button variant="outlined" component="label">
              Upload Ad Image
              <input type="file" accept="image/*" hidden onChange={(e) => formik.setFieldValue('adImage', e.currentTarget.files[0])} />
            </Button>
            {error && <Alert severity="error">{error}</Alert>}
            <Button type="submit" variant="contained" disabled={formik.isSubmitting}>Submit</Button>
          </Stack>
        </Box>
        {submitted && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="success">Submitted! Waiting for approval.</Alert>
            <Typography sx={{ mt: 1 }}><b>Name:</b> {submitted.sponsorName}</Typography>
            <Typography><b>Duration:</b> {submitted.durationMonths === 0.001 ? '1 minute (testing)' : `${submitted.durationMonths} months`}</Typography>
            {submitted.adImagePath && <Box sx={{ mt: 1 }}><img src={toImageUrl(submitted.adImagePath)} alt="ad" width={240} /></Box>}
          </Box>
        )}
      </Paper>
    </Container>
  );
}


