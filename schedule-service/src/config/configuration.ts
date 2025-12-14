export default () => ({
  port: parseInt(process.env.PORT || '3002', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  auth: {
    serviceUrl: process.env.AUTH_SERVICE_URL,
  },
  bull: {
    redis: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    },
  },
  notificationService: {
    url: process.env.NOTIFICATION_SERVICE_URL,
  },
});
