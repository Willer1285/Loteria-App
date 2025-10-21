import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/loteria-app';

    // Opciones de conexión optimizadas para MongoDB Atlas y local
    const options: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 5000, // Timeout después de 5s en lugar de 30s
      socketTimeoutMS: 45000, // Cerrar sockets después de 45s de inactividad
    };

    await mongoose.connect(mongoURI, options);

    const isAtlas = mongoURI.includes('mongodb+srv://');
    const dbName = mongoose.connection.db?.databaseName;

    console.log('✅ MongoDB conectado exitosamente');
    console.log(`📦 Base de datos: ${dbName}`);
    console.log(`🌍 Tipo: ${isAtlas ? 'MongoDB Atlas (Cloud)' : 'MongoDB Local'}`);
  } catch (error: any) {
    console.error('❌ Error conectando a MongoDB:');

    if (error.message?.includes('ECONNREFUSED')) {
      console.error('   - MongoDB no está corriendo localmente');
      console.error('   - Inicia MongoDB o usa MongoDB Atlas');
    } else if (error.message?.includes('authentication failed')) {
      console.error('   - Usuario o contraseña incorrectos');
      console.error('   - Verifica MONGODB_URI en .env');
    } else if (error.message?.includes('Could not connect to any servers')) {
      console.error('   - No se puede conectar al servidor');
      console.error('   - Verifica la URI de conexión');
      console.error('   - Si usas Atlas, verifica IP whitelist');
    } else {
      console.error('   ', error.message);
    }

    process.exit(1);
  }
};

// Event listeners para monitoreo de conexión
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});
