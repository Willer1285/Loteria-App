import mongoose from 'mongoose';
import User from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script de migración para asignar usernames a usuarios existentes
 * que no tienen username asignado
 */
async function migrateUsernames() {
  try {
    // Conectar a la base de datos
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/loteria';
    await mongoose.connect(mongoUri);
    console.log('📦 Conectado a MongoDB');

    // Buscar usuarios sin username
    const usersWithoutUsername = await User.find({
      $or: [
        { username: { $exists: false } },
        { username: null },
        { username: '' }
      ]
    });

    console.log(`🔍 Encontrados ${usersWithoutUsername.length} usuarios sin username`);

    let updated = 0;
    let errors = 0;

    for (const user of usersWithoutUsername) {
      try {
        // Generar username base desde el email
        const emailPart = user.email.split('@')[0];
        // Limpiar caracteres especiales y convertir a minúsculas
        let baseUsername = emailPart
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .substring(0, 20);

        // Si es muy corto, usar parte del nombre
        if (baseUsername.length < 3) {
          const namePart = (user.firstName || 'user').toLowerCase().replace(/[^a-z0-9]/g, '');
          baseUsername = namePart.substring(0, 20);
        }

        // Verificar si el username existe, si sí, agregar número
        let username = baseUsername;
        let counter = 1;

        while (await User.findOne({ username, _id: { $ne: user._id } })) {
          // Si el username existe, agregar número
          const suffix = counter.toString();
          username = baseUsername.substring(0, 20 - suffix.length) + suffix;
          counter++;
        }

        // Actualizar el usuario
        user.username = username;
        await user.save();

        console.log(`✅ Usuario ${user.email} -> username: ${username}`);
        updated++;
      } catch (error: any) {
        console.error(`❌ Error al actualizar usuario ${user.email}:`, error.message);
        errors++;
      }
    }

    console.log('\n📊 Resumen de migración:');
    console.log(`   ✅ Actualizados: ${updated}`);
    console.log(`   ❌ Errores: ${errors}`);
    console.log(`   📝 Total procesados: ${usersWithoutUsername.length}`);

    // Desconectar
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}

// Ejecutar migración
migrateUsernames();
