import cors from 'cors';
const corsOption: cors.CorsOptions = {
  origin: '*', // origin front web server
  methods: ['POST', 'GET', 'OPTIONS'],
  credentials: true,
};

export default cors(corsOption);
