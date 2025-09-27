import React, { useEffect, useState } from 'react';
import { SponsorsAPI, toImageUrl } from '../../services/api';
import { Grid, Card, CardMedia, CardContent, Typography, Chip } from '@mui/material';

export default function HomeAds() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await SponsorsAPI.homepageActiveAds();
        setAds(data.sponsors || []); 
      } catch (e) {
        setError('Failed to load ads');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <div>
      <Typography variant="h5" sx={{ mb: 2 }}>Active Sponsor Ads</Typography>
      {loading && <Typography>Loading...</Typography>}
      {error && <Typography color="error">{error}</Typography>}
      <Grid container spacing={2}>
        {ads.map((a) => (
          <Grid key={a._id} item xs={12} sm={6} md={4} lg={3}>
            <Card>
              {a.adImagePath && (
                <CardMedia component="img" height="160" image={toImageUrl(a.adImagePath)} alt={a.companyName || a.sponsorName} />
              )}
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  {a.companyName || a.sponsorName}
                </Typography>
                {a.startDate && a.endDate && (
                  <Chip size="small" label={`Active ${new Date(a.startDate).toLocaleDateString()} - ${new Date(a.endDate).toLocaleDateString()}`} />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

