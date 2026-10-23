import PageTransition from '../components/PageTransition';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Material } from '../data/mockData';
import { Search, Plus, Edit, Trash2, AlertCircle, Filter, X, Package, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { toast } from 'sonner';
import { useAccessibility } from '../contexts/AccessibilityContext';

export default function InventoryPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { announce } = useAccessibility();
  const { materials, addMaterial, updateMaterial, deleteMaterial, addActivityLog } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('name');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    size: '',
    quantity: 0,
    unit: '',
    minQuantity: 0
  });

  useEffect(() => {
    const query = searchParams.get('q');
    const status = searchParams.get('status');
    if (query !== null) setSearchTerm(query);
    if (status === 'In Stock' || status === 'Low Stock' || status === 'Out of Stock') {
      setStockStatusFilter(status);
    }
  }, [searchParams]);

  useEffect(() => {
    const voiceState = location.state as {
      voiceMaterialDraft?: { name: string };
      voiceEditMaterialId?: string;
    } | null;
    if (
      (!voiceState?.voiceMaterialDraft && !voiceState?.voiceEditMaterialId) ||
      (user?.role !== 'admin' && user?.role !== 'staff')
    ) return;

    navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
    if (voiceState.voiceMaterialDraft) {
      setFormData({
        name: voiceState.voiceMaterialDraft.name,
        category: '',
        size: '',
        quantity: 0,
        unit: '',
        minQuantity: 0,
      });
      setIsAddDialogOpen(true);
      announce('New material form opened. Review and complete all inventory fields before adding it.');
      return;
    }

    if (voiceState.voiceEditMaterialId) {
      const material = materials.find(item => item.id === voiceState.voiceEditMaterialId);
      if (!material) {
        announce('The voice-selected material is no longer available.', 'assertive');
        return;
      }
      setSelectedMaterial(material);
      setFormData({
        name: material.name,
        category: material.category,
        size: material.size ?? '',
        quantity: material.quantity,
        unit: material.unit,
        minQuantity: material.minQuantity,
      });
      setIsEditDialogOpen(true);
      announce(`Edit form opened for ${material.name}. Review all fields before saving.`);
    }
  }, [announce, location.pathname, location.search, location.state, materials, navigate, user?.role]);

  const canEdit = user?.role === 'admin' || user?.role === 'staff';
  const canView = true;

  // Get unique categories and sizes
  const categories = Array.from(new Set(materials.map(m => m.category)));
  const sizes = Array.from(new Set(materials.filter(m => m.size).map(m => m.size as string)));

  // Advanced filtering
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (material.size && material.size.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || material.category === categoryFilter;
    const matchesStockStatus = stockStatusFilter === 'all' || material.status === stockStatusFilter;
    const matchesSize = sizeFilter === 'all' || material.size === sizeFilter;
    return matchesSearch && matchesCategory && matchesStockStatus && matchesSize;
  }).sort((a, b) => {
    if (sortOrder === 'quantity-low') return a.quantity - b.quantity;
    if (sortOrder === 'quantity-high') return b.quantity - a.quantity;
    if (sortOrder === 'updated') return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
    return `${a.name} ${a.size ?? ''}`.localeCompare(`${b.name} ${b.size ?? ''}`);
  });

  // Count statistics
  const statsData = {
    total: materials.length,
    inStock: materials.filter(m => m.status === 'In Stock').length,
    lowStock: materials.filter(m => m.status === 'Low Stock').length,
    outOfStock: materials.filter(m => m.status === 'Out of Stock').length
  };

  const handleAdd = () => {
    if (!formData.name.trim() || !formData.category.trim() || !formData.unit.trim()) {
      toast.error('Material name, category, and unit are required');
      return;
    }
    if (formData.quantity < 0 || formData.minQuantity < 0) {
      toast.error('Inventory quantities cannot be negative');
      return;
    }
    const status = formData.quantity === 0 ? 'Out of Stock' : formData.quantity <= formData.minQuantity ? 'Low Stock' : 'In Stock';

    addMaterial({
      name: formData.name,
      category: formData.category,
      size: formData.size || undefined,
      quantity: formData.quantity,
      unit: formData.unit,
      minQuantity: formData.minQuantity,
      status: status as Material['status'],
      lastUpdated: new Date().toISOString()
    });

    addActivityLog({
      userId: user?.id || '1',
      username: user?.username || 'admin',
      role: user?.role || 'admin',
      action: 'Material Added',
      timestamp: new Date().toISOString(),
      details: `Added ${formData.name}${formData.size ? ` (${formData.size})` : ''} - ${formData.quantity} ${formData.unit}`
    });

    toast.success('Material added successfully');
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedMaterial) return;
    if (!formData.name.trim() || !formData.category.trim() || !formData.unit.trim()) {
      toast.error('Material name, category, and unit are required');
      return;
    }
    if (formData.quantity < 0 || formData.minQuantity < 0) {
      toast.error('Inventory quantities cannot be negative');
      return;
    }

    const status = formData.quantity === 0 ? 'Out of Stock' : formData.quantity <= formData.minQuantity ? 'Low Stock' : 'In Stock';

    updateMaterial(selectedMaterial.id, {
      name: formData.name,
      category: formData.category,
      size: formData.size || undefined,
      quantity: formData.quantity,
      unit: formData.unit,
      minQuantity: formData.minQuantity,
      status: status as Material['status']
    });

    addActivityLog({
      userId: user?.id || '1',
      username: user?.username || 'admin',
      role: user?.role || 'admin',
      action: 'Material Updated',
      timestamp: new Date().toISOString(),
      details: `Updated ${formData.name}${formData.size ? ` (${formData.size})` : ''}`
    });

    toast.success('Material updated successfully');
    setIsEditDialogOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedMaterial) return;

    deleteMaterial(selectedMaterial.id);

    addActivityLog({
      userId: user?.id || '1',
      username: user?.username || 'admin',
      role: user?.role || 'admin',
      action: 'Material Deleted',
      timestamp: new Date().toISOString(),
      details: `Deleted ${selectedMaterial.name}`
    });

    toast.success('Material deleted successfully');
    setIsDeleteDialogOpen(false);
    setSelectedMaterial(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      size: '',
      quantity: 0,
      unit: '',
      minQuantity: 0
    });
    setSelectedMaterial(null);
  };

  const openEditDialog = (material: Material) => {
    setSelectedMaterial(material);
    setFormData({
      name: material.name,
      category: material.category,
      size: material.size || '',
      quantity: material.quantity,
      unit: material.unit,
      minQuantity: material.minQuantity
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (material: Material) => {
    setSelectedMaterial(material);
    setIsDeleteDialogOpen(true);
  };

  return (
    <PageTransition>
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-stone-950">Inventory Management</h1>
          <p className="text-stone-700 mt-1">Manage construction materials and stock levels</p>
        </div>
        {canEdit && (
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-yellow-500 hover:bg-yellow-600 text-stone-950 self-start sm:self-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Material
          </Button>
        )}
      </div>

      {!canEdit && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have view-only access to inventory. Admin and Warehouse Staff can make changes.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Materials</CardTitle>
            <Package className="h-4 w-4 text-stone-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.total}</div>
            <p className="text-xs text-stone-700 mt-1">All items</p>
          </CardContent>
        </Card>

        <Card className="border-green-800 bg-green-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">In Stock</CardTitle>
            <Package className="h-4 w-4 text-green-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{statsData.inStock}</div>
            <p className="text-xs text-green-100 mt-1">Available materials</p>
          </CardContent>
        </Card>

        <Card className="border-amber-700 bg-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-stone-950">Low Stock</CardTitle>
            <AlertCircle className="h-4 w-4 text-stone-950" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-950">{statsData.lowStock}</div>
            <p className="text-xs text-stone-900 mt-1">Need replenishment</p>
          </CardContent>
        </Card>

        <Card className="border-red-800 bg-red-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Out of Stock</CardTitle>
            <X className="h-4 w-4 text-red-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{statsData.outOfStock}</div>
            <p className="text-xs text-red-100 mt-1">Unavailable items</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-orange-600" />
            Advanced Filtering
          </CardTitle>
          <CardDescription>Search and filter materials by multiple criteria</CardDescription>
          <div className="flex flex-col gap-4 mt-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-500" />
                <Input
                  id="inventory-search"
                  aria-label="Search inventory by material ID, name, category, or size"
                  placeholder="Search materials by name, category, or size..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Filter Controls */}
            <div className="grid gap-3 md:grid-cols-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger aria-label="Filter inventory by category">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={stockStatusFilter} onValueChange={setStockStatusFilter}>
                <SelectTrigger aria-label="Filter inventory by stock status">
                  <SelectValue placeholder="Filter by stock status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock Status</SelectItem>
                  <SelectItem value="In Stock">In Stock</SelectItem>
                  <SelectItem value="Low Stock">Low Stock</SelectItem>
                  <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sizeFilter} onValueChange={setSizeFilter}>
                <SelectTrigger aria-label="Filter inventory by material size">
                  <SelectValue placeholder="Filter by size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sizes</SelectItem>
                  {sizes.map(size => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger aria-label="Sort inventory">
                  <SelectValue placeholder="Sort inventory" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name A–Z</SelectItem>
                  <SelectItem value="quantity-low">Quantity: Low to High</SelectItem>
                  <SelectItem value="quantity-high">Quantity: High to Low</SelectItem>
                  <SelectItem value="updated">Recently Updated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters Display */}
            {(categoryFilter !== 'all' || stockStatusFilter !== 'all' || sizeFilter !== 'all' || searchTerm) && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-stone-700">Active filters:</span>
                {searchTerm && (
                  <Badge variant="outline" className="gap-1">
                    Search: {searchTerm}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 p-0 hover:bg-stone-200"
                      onClick={() => setSearchTerm('')}
                      aria-label="Clear search filter"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                {categoryFilter !== 'all' && (
                  <Badge variant="outline" className="gap-1">
                    Category: {categoryFilter}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 p-0 hover:bg-stone-200"
                      onClick={() => setCategoryFilter('all')}
                      aria-label="Clear category filter"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                {stockStatusFilter !== 'all' && (
                  <Badge variant="outline" className="gap-1">
                    Status: {stockStatusFilter}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 p-0 hover:bg-stone-200"
                      onClick={() => setStockStatusFilter('all')}
                      aria-label="Clear stock status filter"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                {sizeFilter !== 'all' && (
                  <Badge variant="outline" className="gap-1">
                    Size: {sizeFilter}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 p-0 hover:bg-stone-200"
                      onClick={() => setSizeFilter('all')}
                      aria-label="Clear size filter"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('all');
                    setStockStatusFilter('all');
                    setSizeFilter('all');
                  }}
                  className="text-xs h-7"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {filteredMaterials.length} material {filteredMaterials.length === 1 ? 'result' : 'results'} found.
          </div>

          {/* Cards keep the same information and actions readable without sideways scrolling. */}
          <div className="grid gap-3 md:grid-cols-2 xl:hidden" aria-label="Inventory materials">
            {filteredMaterials.length > 0 ? (
              filteredMaterials.map(material => (
                <Card key={material.id} className="border-stone-300 shadow-none">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-mono text-xs text-stone-600">{material.id}</div>
                        <h3 className="truncate text-base font-bold text-stone-950">{material.name}</h3>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          <Badge variant="outline" className="text-xs">{material.category}</Badge>
                          {material.size && (
                            <Badge className="bg-stone-200 text-stone-900 hover:bg-stone-300 text-xs">
                              {material.size}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge
                        className={`flex shrink-0 items-center gap-1 ${
                          material.status === 'In Stock'
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : material.status === 'Low Stock'
                            ? 'bg-amber-500 text-stone-950 hover:bg-amber-600'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                      >
                        {material.status === 'In Stock' && <CheckCircle className="h-3 w-3" />}
                        {material.status === 'Low Stock' && <AlertTriangle className="h-3 w-3" />}
                        {material.status === 'Out of Stock' && <XCircle className="h-3 w-3" />}
                        {material.status}
                      </Badge>
                    </div>

                    <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-stone-200 pt-3">
                      <div>
                        <dt className="text-xs font-bold uppercase tracking-wide text-stone-600">Quantity</dt>
                        <dd className="mt-0.5 text-sm font-semibold text-stone-950">
                          {material.quantity} {material.unit}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-bold uppercase tracking-wide text-stone-600">Minimum</dt>
                        <dd className="mt-0.5 text-sm text-stone-800">
                          {material.minQuantity} {material.unit}
                        </dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-xs font-bold uppercase tracking-wide text-stone-600">Last Updated</dt>
                        <dd className="mt-0.5 text-sm text-stone-800">
                          {new Date(material.lastUpdated).toLocaleDateString()}
                        </dd>
                      </div>
                    </dl>

                    {canEdit && (
                      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-stone-200 pt-3">
                        <Button
                          variant="outline"
                          onClick={() => openEditDialog(material)}
                          aria-label={`Edit ${material.name} ${material.size ?? ''}`.trim()}
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => openDeleteDialog(material)}
                          className="border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
                          aria-label={`Delete ${material.name} ${material.size ?? ''}`.trim()}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="border border-stone-300 p-6 text-center text-sm text-stone-600">
                No materials found matching your filters
              </div>
            )}
          </div>

          <div className="hidden rounded-md border overflow-x-auto xl:block">
            <Table aria-label="Inventory materials">
              <TableCaption className="sr-only">
                Inventory materials with quantities, stock status, and last update date.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Material ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Size/Spec</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  {canEdit && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.length > 0 ? (
                  filteredMaterials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium">{material.id}</TableCell>
                      <TableCell className="font-medium">{material.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {material.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {material.size ? (
                          <Badge className="bg-stone-200 text-stone-900 hover:bg-stone-300 text-xs">
                            {material.size}
                          </Badge>
                        ) : (
                          <span className="text-xs text-stone-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{material.quantity}</span> {material.unit}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`flex items-center gap-1 w-fit ${
                            material.status === 'In Stock'
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : material.status === 'Low Stock'
                              ? 'bg-amber-500 text-stone-950 hover:bg-amber-600'
                              : 'bg-red-600 text-white hover:bg-red-700'
                          }`}
                        >
                          {material.status === 'In Stock' && <CheckCircle className="h-3 w-3" />}
                          {material.status === 'Low Stock' && <AlertTriangle className="h-3 w-3" />}
                          {material.status === 'Out of Stock' && <XCircle className="h-3 w-3" />}
                          {material.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-stone-700">
                        {new Date(material.lastUpdated).toLocaleDateString()}
                      </TableCell>
                      {canEdit && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(material)}
                              className="hover:bg-orange-50"
                              aria-label={`Edit ${material.name} ${material.size ?? ''}`.trim()}
                            >
                              <Edit className="h-4 w-4 text-orange-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(material)}
                              className="hover:bg-red-50"
                              aria-label={`Delete ${material.name} ${material.size ?? ''}`.trim()}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={canEdit ? 8 : 7} className="text-center py-8 text-stone-600">
                      No materials found matching your filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Material Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Material</DialogTitle>
            <DialogDescription>Enter the details of the new material</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-material-name">Material Name</Label>
              <Input
                id="add-material-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Steel Rebars 12mm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-material-category">Category</Label>
              <Input
                id="add-material-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Steel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-material-size">Size</Label>
              <Input
                id="add-material-size"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                placeholder="e.g., 12mm, 10kg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-material-quantity">Quantity</Label>
                <Input
                  id="add-material-quantity"
                  type="number"
                  min={0}
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-material-unit">Unit</Label>
                <Input
                  id="add-material-unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g., pcs, bags"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-material-minimum">Minimum Quantity</Label>
              <Input
                id="add-material-minimum"
                type="number"
                min={0}
                value={formData.minQuantity}
                onChange={(e) => setFormData({ ...formData, minQuantity: Number(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAdd}
              disabled={!formData.name.trim() || !formData.category.trim() || !formData.unit.trim() || formData.quantity < 0 || formData.minQuantity < 0}
              className="bg-yellow-500 hover:bg-yellow-600 text-stone-950"
            >
              Add Material
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Material Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Material</DialogTitle>
            <DialogDescription>Update material details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-material-name">Material Name</Label>
              <Input
                id="edit-material-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-material-category">Category</Label>
              <Input
                id="edit-material-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-material-size">Size</Label>
              <Input
                id="edit-material-size"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-material-quantity">Quantity</Label>
                <Input
                  id="edit-material-quantity"
                  type="number"
                  min={0}
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-material-unit">Unit</Label>
                <Input
                  id="edit-material-unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-material-minimum">Minimum Quantity</Label>
              <Input
                id="edit-material-minimum"
                type="number"
                min={0}
                value={formData.minQuantity}
                onChange={(e) => setFormData({ ...formData, minQuantity: Number(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleEdit}
              disabled={!formData.name.trim() || !formData.category.trim() || !formData.unit.trim() || formData.quantity < 0 || formData.minQuantity < 0}
              className="bg-yellow-500 hover:bg-yellow-600 text-stone-950"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Material</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedMaterial?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </PageTransition>
  );
}
