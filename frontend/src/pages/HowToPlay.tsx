import { Link } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import { Ticket, DollarSign, Trophy, CheckCircle, Gift, Home, Car, Banknote } from 'lucide-react';

const HowToPlay = () => {
  return (
    <PublicLayout>
      <div className="space-y-12">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl shadow-xl p-12 text-white text-center">
          <h1 className="text-5xl font-bold mb-4">¿Cómo Jugar?</h1>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto">
            Participa en nuestros sorteos y gana premios increíbles. Es fácil, seguro y transparente.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-primary-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">1. Regístrate</h3>
            <p className="text-gray-600">
              Crea tu cuenta gratis en segundos. Solo necesitas un email y una contraseña.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="text-blue-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">2. Recarga tu Billetera</h3>
            <p className="text-gray-600">
              Añade fondos a tu cuenta de forma segura con diversos métodos de pago.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="text-green-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">3. Compra Boletos</h3>
            <p className="text-gray-600">
              Elige tu sorteo favorito y compra boletos con tus números de la suerte.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="text-yellow-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">4. ¡Gana Premios!</h3>
            <p className="text-gray-600">
              Si tus números coinciden, ¡ganas! Los premios se pagan automáticamente.
            </p>
          </div>
        </div>

        {/* Prizes Section */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-12 border-2 border-yellow-200">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Premios Increíbles te Esperan
            </h2>
            <p className="text-xl text-gray-700">
              Gana desde dinero en efectivo hasta premios físicos de alto valor
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:scale-105 transition-transform">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Banknote className="text-green-600" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Dinero en Efectivo</h3>
              <p className="text-gray-600 mb-4">
                Desde $100 hasta $100,000 en premios en efectivo directo a tu cuenta
              </p>
              <div className="text-4xl font-bold text-green-600">$$$</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:scale-105 transition-transform">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="text-blue-600" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Vehículos</h3>
              <p className="text-gray-600 mb-4">
                Autos, motos y vehículos de alta gama en sorteos especiales
              </p>
              <div className="text-4xl font-bold text-blue-600">🚗</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:scale-105 transition-transform">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="text-purple-600" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Casas</h3>
              <p className="text-gray-600 mb-4">
                Propiedades y departamentos en ubicaciones privilegiadas
              </p>
              <div className="text-4xl font-bold text-purple-600">🏡</div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-2xl shadow-xl p-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            ¿Por qué Jugar con Nosotros?
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">100% Transparente</h3>
                <p className="text-gray-600">
                  Todos los sorteos son verificables y públicos. Puedes ver los resultados en tiempo real.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Pagos Automáticos</h3>
                <p className="text-gray-600">
                  Si ganas, tu premio se deposita automáticamente en tu billetera. Sin trámites.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="text-purple-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Seguro y Confiable</h3>
                <p className="text-gray-600">
                  Tu información y dinero están protegidos con la mejor tecnología de seguridad.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="text-yellow-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Múltiples Sorteos</h3>
                <p className="text-gray-600">
                  Nuevos sorteos todas las semanas con diferentes premios y precios de boletos.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl shadow-xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">¿Listo para Ganar?</h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Únete a miles de jugadores que ya están ganando premios increíbles
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-primary-600 rounded-lg font-bold text-lg hover:bg-primary-50 transition-colors shadow-lg"
            >
              Crear Cuenta Gratis
            </Link>
            <Link
              to="/"
              className="px-8 py-4 bg-primary-700 text-white rounded-lg font-bold text-lg hover:bg-primary-800 transition-colors shadow-lg"
            >
              Ver Sorteos Activos
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default HowToPlay;
