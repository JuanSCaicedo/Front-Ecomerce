cat > /mnt/user-data/outputs/README_Front-Ecomerce.md << 'EOF'
# Front-Ecomerce

Tienda online construida con Angular 17. Es la interfaz que ven los clientes del ecommerce: catálogo de productos, carrito, checkout con pagos reales y gestión de su cuenta. Consume los servicios de [Api-Ecommerce](https://github.com/JuanSCaicedo/Api-Ecommerce).

> 📄 Documentación técnica completa: [deepwiki.com/JuanSCaicedo/Front-Ecomerce](https://deepwiki.com/JuanSCaicedo/Front-Ecomerce)  
> 🌐 Demo en producción: [ecommerce.juandevops.com](https://ecommerce.juandevops.com)

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Angular 17 |
| Lenguaje | TypeScript |
| Estilos | Bootstrap + SASS |
| HTTP | Angular HttpClient (consumo de API REST) |
| Autenticación | JWT almacenado en cliente, Guards por ruta |
| Build | Node.js v18 |
| Deploy | Cloudflare Pages / VPS OCI |

---

## Arquitectura del frontend

El proyecto sigue una arquitectura **modular por características**, donde cada sección de la tienda es un módulo independiente con lazy loading:

```
src/app/
├── core/                  # Servicios globales, interceptores HTTP, guards
│   ├── interceptors/      # Adjunta JWT a cada petición
│   ├── guards/            # Protección de rutas por autenticación
│   └── services/          # AuthService, CartService, UserService...
├── shared/                # Componentes reutilizables (navbar, footer, loaders)
├── modules/
│   ├── home/              # Página de inicio con productos destacados y sliders
│   ├── catalog/           # Listado de productos con filtros por categoría y marca
│   ├── product-detail/    # Vista individual del producto
│   ├── cart/              # Carrito de compras con actualización en tiempo real
│   ├── checkout/          # Flujo de compra + integración con MercadoPago / PayPal
│   ├── auth/              # Registro, login y recuperación de contraseña
│   └── account/           # Perfil del cliente y gestión de direcciones
```

---

## Funcionalidades

### Catálogo
- Página de inicio con productos destacados, sliders y contenido dinámico configurable desde el admin
- Navegación por categorías y marcas
- Filtros básicos de búsqueda
- Vista detallada de cada producto con galería de imágenes, descripción y precio

### Carrito de compras
- Agregar productos desde el catálogo o detalle
- Actualizar cantidades y eliminar ítems
- Cálculo de subtotal y total en tiempo real
- Carrito persistente para usuarios autenticados

### Checkout y pagos
- Selección o registro de dirección de envío
- Resumen del pedido antes de confirmar
- Pago con **MercadoPago** (redireccionamiento al SDK)
- Pago con **PayPal** (integración via API)
- Confirmación de orden tras respuesta del proveedor de pagos

### Cuenta del cliente
- Registro con verificación de correo
- Login / Logout con JWT
- Edición de perfil
- Gestión de múltiples direcciones de envío
- Historial de pedidos con estado actualizado

---

## Comunicación con la API

Toda la comunicación es mediante HTTP/HTTPS en formato JSON. El frontend nunca accede directamente a la base de datos.

```
Cliente Angular  →  GET /api/products?category=3
                ←  { success: true, data: [...productos] }

Cliente Angular  →  POST /api/orders  + JWT Header
                ←  { success: true, data: { order_id, payment_url } }
```

Un interceptor HTTP adjunta automáticamente el token JWT en cada petición a endpoints protegidos.

---

## Requisitos

- Node.js >= 18
- Angular CLI >= 17
- La [Api-Ecommerce](https://github.com/JuanSCaicedo/Api-Ecommerce) corriendo localmente o apuntando al entorno de producción

---

## Instalación local

```bash
git clone https://github.com/JuanSCaicedo/Front-Ecomerce.git
cd Front-Ecomerce
npm install
# Configurar la URL base de la API en src/environments/environment.ts
ng serve
```

La aplicación estará disponible en `https://ecommerce.juandevops.com`.

---

## Build para producción

```bash
ng build --configuration production
```

Los archivos compilados quedan en `/dist` y se sirven como contenido estático desde el servidor o CDN.

---

## Despliegue

El frontend compilado se despliega en el VPS de Oracle Cloud Infrastructure. Cloudflare actúa como proxy inverso, añadiendo caché, protección contra bots y HTTPS automático.

---

## Repositorios relacionados

| Repositorio | Descripción |
|-------------|-------------|
| [Api-Ecommerce](https://github.com/JuanSCaicedo/Api-Ecommerce) | Backend Laravel 10 (fuente de datos) |
| [Admin-EcommerceE](https://github.com/JuanSCaicedo/Admin-EcommerceE) | Panel administrativo Angular 16 |

EOF
echo "README Front creado"
