import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  jwtSecret: process.env.JWT_SECRET || 'reelflix_super_secret_jwt_key_2026_cinematic',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/reelflix_db?schema=public',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  paymentProviderKey: process.env.PAYMENT_PROVIDER_KEY || 'rzp_test_reelflix_mock_key',
  paymentProviderSecret: process.env.PAYMENT_PROVIDER_SECRET || 'rzp_test_reelflix_mock_secret',
  cdnBaseUrl: process.env.CDN_BASE_URL || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample',
};
