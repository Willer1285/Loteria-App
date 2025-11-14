import mongoose from 'mongoose';
import User from '../models/User';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../../.env') });

const createAdminUser = async () => {
  try {
    // Conectar a MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/loteria';
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB');

    // Datos del administrador
    const adminData = {
      email: 'admin@loteria.com',
      password: 'admin123456', // Cambia esto por una contraseña segura
      firstName: 'Administrador',
      lastName: 'Principal',
      role: 'admin' as const,
      balance: 0,
      isActive: true,
      isBanned: false,
    };

    // Verificar si ya existe un admin con ese email
    const existingAdmin = await User.findOne({ email: adminData.email });

    if (existingAdmin) {
      console.log('⚠️  Ya existe un usuario con el email:', adminData.email);
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Nombre:', existingAdmin.firstName, existingAdmin.lastName);
      console.log('🔑 Rol:', existingAdmin.role);

      // Preguntar si desea actualizar el rol a admin
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Usuario actualizado a rol ADMIN');
      }
    } else {
      // Crear nuevo usuario admin
      const admin = await User.create(adminData);
      console.log('\n✅ Usuario administrador creado exitosamente!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email:', admin.email);
      console.log('🔑 Contraseña:', adminData.password);
      console.log('👤 Nombre:', admin.firstName, admin.lastName);
      console.log('🎯 Rol:', admin.role);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n⚠️  IMPORTANTE: Cambia la contraseña después del primer login\n');
    }

    await mongoose.connection.close();
    console.log('✅ Desconectado de MongoDB');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error al crear usuario administrador:', error.message);
    process.exit(1);
  }
};

createAdminUser();
