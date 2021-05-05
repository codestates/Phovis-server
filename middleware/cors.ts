import cors from 'cors';
const corsOption: cors.CorsOptions = {
  origin: [
    'http://localhost:3000',
    'https://localhost:3000',
    'https://phovis.ga',
    'http://phovis.ga',
  ], // origin front web server
  methods: ['POST', 'GET', 'PUT', 'OPTIONS', 'DELETE'],
  credentials: true,
};

export default cors(corsOption);
