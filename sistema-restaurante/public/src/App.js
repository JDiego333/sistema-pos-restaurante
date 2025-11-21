import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, FileText, Plus, Trash2, Edit, Search, AlertCircle, DollarSign, TrendingDown, BarChart3, Calendar, TrendingUp } from 'lucide-react';

const RestaurantPOS = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [clientName, setClientName] = useState('');

  // Cargar datos al iniciar
  useEffect(() => {
    loadData();
  }, []);

  // Guardar datos automáticamente
  useEffect(() => {
    saveData();
  }, [products, invoices]);

  const loadData = () => {
    try {
      const productsData = localStorage.getItem('restaurant_products');
      const invoicesData = localStorage.getItem('restaurant_invoices');
      
      if (productsData) {
        setProducts(JSON.parse(productsData));
      } else {
        const sampleProducts = [
          { id: 1, name: 'Hamburguesa Clásica', category: 'Comida', price: 25000, stock: 50, minStock: 10 },
          { id: 2, name: 'Pizza Margarita', category: 'Comida', price: 35000, stock: 30, minStock: 8 },
          { id: 3, name: 'Cerveza', category: 'Bebidas', price: 8000, stock: 100, minStock: 20 },
          { id: 4, name: 'Gaseosa', category: 'Bebidas', price: 5000, stock: 80, minStock: 15 },
        ];
        setProducts(sampleProducts);
      }
      
      if (invoicesData) {
        setInvoices(JSON.parse(invoicesData));
      }
    } catch (error) {
      console.log('Primera carga del sistema');
    }
  };

  const saveData = () => {
    try {
      localStorage.setItem('restaurant_products', JSON.stringify(products));
      localStorage.setItem('restaurant_invoices', JSON.stringify(invoices));
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  const addOrUpdateProduct = (productData) => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...productData, id: p.id } : p));
      setEditingProduct(null);
    } else {
      const newProduct = { ...productData, id: Date.now() };
      setProducts([...products, newProduct]);
    }
    setShowProductForm(false);
  };

  const deleteProduct = (id) => {
    if (window.confirm('¿Eliminar este producto?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateCartQuantity = (id, quantity) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item => item.id === id ? { ...item, quantity } : item));
    }
  };

  const generateInvoice = () => {
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.19;
    const total = subtotal + tax;

    // MEJORA: Guardamos la fecha en formato ISO para poder filtrar después
    const now = new Date();
    const invoice = {
      id: Date.now(),
      date: now.toLocaleString('es-CO'),
      dateISO: now.toISOString(), // NUEVO: Fecha en formato estándar para filtros
      dateOnly: now.toISOString().split('T')[0], // NUEVO: Solo la fecha (YYYY-MM-DD)
      client: clientName || 'Cliente General',
      items: cart,
      subtotal,
      tax,
      total
    };

    const updatedProducts = products.map(product => {
      const cartItem = cart.find(item => item.id === product.id);
      if (cartItem) {
        return { ...product, stock: product.stock - cartItem.quantity };
      }
      return product;
    });

    setProducts(updatedProducts);
    setInvoices([invoice, ...invoices]);
    setCart([]);
    setClientName('');
    alert('Factura generada exitosamente');
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-orange-600 flex items-center gap-3">
            <ShoppingCart className="w-8 h-8" />
            Sistema POS - Restaurante
          </h1>
          <p className="text-gray-600 mt-2">Gestión de Inventario y Facturación</p>
        </div>

        {/* Alertas de Stock Bajo */}
        {lowStockProducts.length > 0 && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-red-600" />
              <span className="font-semibold text-red-800">
                {lowStockProducts.length} producto(s) con stock bajo
              </span>
            </div>
          </div>
        )}

        {/* Tabs - AGREGAMOS LA NUEVA PESTAÑA DE REPORTES */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'inventory' 
                ? 'bg-orange-600 text-white shadow-lg' 
                : 'bg-white text-gray-700 hover:bg-orange-100'
            }`}
          >
            <Package className="w-5 h-5" />
            Inventario
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'billing' 
                ? 'bg-orange-600 text-white shadow-lg' 
                : 'bg-white text-gray-700 hover:bg-orange-100'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            Facturación
          </button>
          
          {/* NUEVA PESTAÑA: REPORTES */}
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'reports' 
                ? 'bg-orange-600 text-white shadow-lg' 
                : 'bg-white text-gray-700 hover:bg-orange-100'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Reportes
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'history' 
                ? 'bg-orange-600 text-white shadow-lg' 
                : 'bg-white text-gray-700 hover:bg-orange-100'
            }`}
          >
            <FileText className="w-5 h-5" />
            Historial ({invoices.length})
          </button>
        </div>

        {/* Contenido Principal */}
        {activeTab === 'inventory' && (
          <InventoryTab
            products={filteredProducts}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            showProductForm={showProductForm}
            setShowProductForm={setShowProductForm}
            editingProduct={editingProduct}
            setEditingProduct={setEditingProduct}
            addOrUpdateProduct={addOrUpdateProduct}
            deleteProduct={deleteProduct}
            lowStockProducts={lowStockProducts}
          />
        )}

        {activeTab === 'billing' && (
          <BillingTab
            products={filteredProducts}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            cart={cart}
            addToCart={addToCart}
            updateCartQuantity={updateCartQuantity}
            clientName={clientName}
            setClientName={setClientName}
            generateInvoice={generateInvoice}
          />
        )}

        {/* NUEVO COMPONENTE: REPORTES */}
        {activeTab === 'reports' && (
          <ReportsTab invoices={invoices} products={products} />
        )}

        {activeTab === 'history' && (
          <HistoryTab invoices={invoices} />
        )}
      </div>
    </div>
  );
};

// ====== NUEVO COMPONENTE: REPORTES DE VENTAS ======
const ReportsTab = ({ invoices, products }) => {
  // Estado para la fecha seleccionada (por defecto hoy)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Filtrar facturas por la fecha seleccionada
  const filteredInvoices = invoices.filter(inv => inv.dateOnly === selectedDate);
  
  // Calcular total de ventas del día
  const totalSales = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalInvoices = filteredInvoices.length;
  const totalItems = filteredInvoices.reduce((sum, inv) => 
    sum + inv.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );

  // Calcular productos más vendidos del día
  const productSales = {};
  filteredInvoices.forEach(invoice => {
    invoice.items.forEach(item => {
      if (productSales[item.name]) {
        productSales[item.name].quantity += item.quantity;
        productSales[item.name].total += item.price * item.quantity;
      } else {
        productSales[item.name] = {
          name: item.name,
          quantity: item.quantity,
          total: item.price * item.quantity
        };
      }
    });
  });

  // Convertir a array y ordenar por cantidad vendida
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Obtener fechas únicas de todas las facturas para el selector
  const availableDates = [...new Set(invoices.map(inv => inv.dateOnly))].sort().reverse();

  return (
    <div className="space-y-6">
      {/* Selector de Fecha */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Reportes de Ventas
          </h2>
          <div className="flex items-center gap-3">
            <label className="font-semibold text-gray-700">Fecha:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Selector rápido de fechas disponibles */}
        {availableDates.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-600">Fechas con ventas:</span>
            {availableDates.slice(0, 7).map(date => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                  selectedDate === date
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-orange-100'
                }`}
              >
                {new Date(date + 'T00:00:00').toLocaleDateString('es-CO', { 
                  day: '2-digit', 
                  month: 'short' 
                })}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Total Ventas */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold opacity-90">Total Ventas</h3>
            <DollarSign className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-3xl font-bold">${totalSales.toLocaleString('es-CO')}</p>
          <p className="text-sm opacity-80 mt-2">{selectedDate}</p>
        </div>

        {/* Número de Facturas */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold opacity-90">Facturas</h3>
            <FileText className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-3xl font-bold">{totalInvoices}</p>
          <p className="text-sm opacity-80 mt-2">Transacciones realizadas</p>
        </div>

        {/* Productos Vendidos */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold opacity-90">Productos</h3>
            <Package className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-3xl font-bold">{totalItems}</p>
          <p className="text-sm opacity-80 mt-2">Unidades vendidas</p>
        </div>
      </div>

      {/* Productos Más Vendidos */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-orange-600" />
          Top 5 Productos del Día
        </h3>
        {topProducts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay ventas para esta fecha</p>
        ) : (
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-orange-300 transition-all">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-lg">#{index + 1}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800">{product.name}</h4>
                  <p className="text-sm text-gray-600">{product.quantity} unidades vendidas</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-orange-600">
                    ${product.total.toLocaleString('es-CO')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lista de Facturas del Día */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Detalle de Facturas ({filteredInvoices.length})
        </h3>
        {filteredInvoices.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay facturas para esta fecha</p>
        ) : (
          <div className="space-y-3">
            {filteredInvoices.map(invoice => (
              <div key={invoice.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-gray-800">Factura #{invoice.id}</h4>
                    <p className="text-sm text-gray-600">{invoice.date}</p>
                    <p className="text-sm font-semibold text-gray-700">{invoice.client}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-600">
                      ${invoice.total.toLocaleString('es-CO')}
                    </p>
                    <p className="text-sm text-gray-600">{invoice.items.length} producto(s)</p>
                  </div>
                </div>
                <div className="border-t pt-2 mt-2 text-sm text-gray-600">
                  {invoice.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{item.name} x{item.quantity}</span>
                      <span className="font-semibold">${(item.price * item.quantity).toLocaleString('es-CO')}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Componente de Inventario (sin cambios)
const InventoryTab = ({ products, searchTerm, setSearchTerm, showProductForm, setShowProductForm, editingProduct, setEditingProduct, addOrUpdateProduct, deleteProduct }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Inventario de Productos</h2>
          <button
            onClick={() => {
              setShowProductForm(true);
              setEditingProduct(null);
            }}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Agregar Producto
          </button>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {showProductForm && (
          <ProductForm
            editingProduct={editingProduct}
            onSave={addOrUpdateProduct}
            onCancel={() => {
              setShowProductForm(false);
              setEditingProduct(null);
            }}
          />
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map(product => (
            <div key={product.id} className={`border rounded-lg p-4 ${product.stock <= product.minStock ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg">{product.name}</h3>
                  <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">{product.category}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingProduct(product);
                      setShowProductForm(true);
                    }}
                    className="text-blue-600 hover:bg-blue-100 p-1 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="text-red-600 hover:bg-red-100 p-1 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-orange-600">
                  ${product.price.toLocaleString('es-CO')}
                </p>
                <div className="flex justify-between items-center">
                  <span className={`font-semibold ${product.stock <= product.minStock ? 'text-red-600' : 'text-gray-700'}`}>
                    Stock: {product.stock}
                  </span>
                  {product.stock <= product.minStock && (
                    <span className="text-xs text-red-600 flex items-center gap-1">
                      <TrendingDown className="w-4 h-4" />
                      Stock bajo
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Rest of components remain the same...
const ProductForm = ({ editingProduct, onSave, onCancel }) => {
  const [formData, setFormData] = useState(editingProduct || {
    name: '',
    category: '',
    price: '',
    stock: '',
    minStock: 10
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.category || !formData.price || !formData.stock) {
      alert('Por favor completa todos los campos');
      return;
    }
    onSave({
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      minStock: parseInt(formData.minStock)
    });
  };

  return (
    <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-bold mb-4">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Nombre del Producto</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Categoría</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Precio</label>
            <input
              type="number"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Stock Actual</label>
            <input
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Stock Mínimo (Alerta)</label>
            <input
              type="number"
              min="0"
              value={formData.minStock}
              onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 font-semibold"
          >
            {editingProduct ? 'Actualizar' : 'Guardar'}
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 font-semibold"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

const BillingTab = ({ products, searchTerm, setSearchTerm, cart, addToCart, updateCartQuantity, clientName, setClientName, generateInvoice }) => {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.19;
  const total = subtotal + tax;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Productos Disponibles</h2>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
          </div>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {products.map(product => (
            <div
              key={product.id}
              onClick={() => product.stock > 0 && addToCart(product)}
              className={`border rounded-lg p-3 flex justify-between items-center ${product.stock > 0
                  ? 'cursor-pointer hover:bg-orange-50 border-gray-200'
                  : "bg-gray-100 border-gray-300 opacity"} />))}
          : 'bg-gray-100 border-gray-300 opacity-50'
          }`}
          >
          <div>
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-sm text-gray-600">{product.category}</p>
            <p className="text-xs text-gray-500">Stock: {product.stock}</p>
          </div>
          <p className="text-lg font-bold text-orange-600">${product.price.toLocaleString('es-CO')}</p>
        </div>
        ))}
      </div>
    </div><div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Carrito de Compras</h2>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Nombre del Cliente</label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Cliente General"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
        </div>

        <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-8">El carrito está vacío</p>
          ) : (
            cart.map(item => (
              <div key={item.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-sm text-gray-600">${item.price.toLocaleString('es-CO')} c/u</p>
                  </div>
                  <button
                    onClick={() => updateCartQuantity(item.id, 0)}
                    className="text-red-600 hover:bg-red-100 p-1 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                    className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 font-bold"
                  >
                    -
                  </button>
                  <span className="font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                    className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 font-bold"
                  >
                    +
                  </button>
                  <span className="ml-auto font-bold text-orange-600">
                    ${(item.price * item.quantity).toLocaleString('es-CO')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-lg">
            <span>Subtotal:</span>
            <span className="font-semibold">${subtotal.toLocaleString('es-CO')}</span>
          </div>
          <div className="flex justify-between text-lg">
            <span>IVA (19%):</span>
            <span className="font-semibold">${tax.toLocaleString('es-CO')}</span>
          </div>
          <div className="flex justify-between text-2xl font-bold text-orange-600 border-t pt-2">
            <span>Total:</span>
            <span>${total.toLocaleString('es-CO')}</span>
          </div>
        </div>

        <button
          onClick={generateInvoice}
          disabled={cart.length === 0}
          className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 font-bold text-lg mt-6 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Generar Factura
        </button>
      </div>
    </div>
  );
};

const HistoryTab = ({ invoices }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Historial de Facturas</h2>
      {invoices.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No hay facturas registradas</p>
      ) : (
        <div className="space-y-4">
          {invoices.map(invoice => (
            <div key={invoice.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg">Factura #{invoice.id}</h3>
                  <p className="text-sm text-gray-600">{invoice.date}</p>
                  <p className="text-sm font-semibold text-gray-700">{invoice.client}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-600">${invoice.total.toLocaleString('es-CO')}</p>
                  <p className="text-sm text-gray-600">{invoice.items.length} producto(s)</p>
                </div>
              </div>
              <div className="border-t pt-3 space-y-1">
                {invoice.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{item.name} x{item.quantity}</span>
                    <span className="font-semibold">${(item.price * item.quantity).toLocaleString('es-CO')}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantPOS;
