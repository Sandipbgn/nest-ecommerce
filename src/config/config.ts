export default () => ({
  port: parseInt(process.env.PORT as string) || 3000,
  database: {
    dbType: process.env.DB_TYPE || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT as string) || 5432,
    username: process.env.DB_USERNAME || 'user',
    password: process.env.DB_PASSWORD || 'password',
    databaseName: process.env.DB_DATABASE || 'app_db',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'cloud_name',
    apiKey: process.env.CLOUDINARY_API_KEY || 'api_key',
    apiSecret: process.env.CLOUDINARY_API_SECRET || 'api_secret',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
});
