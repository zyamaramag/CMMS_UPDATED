import PageTransition from '../components/PageTransition';
import { useState } from 'react';
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

export default function InventoryPage() {
  const { user } = useAuth();
  const { materials, addMaterial, updateMaterial, deleteMaterial, addActivityLog } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');
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

  const canEdit = user?.role === 'staff'; // Only warehouse staff can edit inventory
  const canView = true;

  // Get unique categories and sizes
  const categories = Array.from(new Set(materials.map(m => m.category)));
  const sizes = Array.from(new Set(materials.filter(m => m.size).map(m => m.size as string)));

  // Advanced filtering
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (material.size && material.size.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || material.category === categoryFilter;
    const matchesStockStatus = stockStatusFilter === 'all' || material.status === stockStatusFilter;
    const matchesSize = sizeFilter === 'all' || material.size === sizeFilter;
    return matchesSearch && matchesCategory && matchesStockStatus && matchesSize;
  });

  // Count statistics
  const statsData = {
    total: materials.length,
    inStock: materials.filter(m => m.status === 'In Stock').length,
    lowStock: materials.filter(m => m.status === 'Low Stock').length,
    outOfStock: materials.filter(m => m.status === 'Out of Stock').length
  };

  const handleAdd = () => {
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
            You have view-only access to inventory. Only warehouse staff can make changes.
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

        <Card className="border-red-800 bg-red-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Low Stock</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{statsData.lowStock}</div>
            <p className="text-xs text-red-100 mt-1">Need replenishment</p>
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
                  placeholder="Search materials by name, category, or size..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Filter Controls */}
            <div className="grid gap-3 md:grid-cols-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
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
                <SelectTrigger>
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
                <SelectTrigger>
                  <SelectValue placeholder="Filter by size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sizes</SelectItem>
                  {sizes.map(size => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  ))}
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
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm('')} />
                  </Badge>
                )}
                {categoryFilter !== 'all' && (
                  <Badge variant="outline" className="gap-1">
                    Category: {categoryFilter}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setCategoryFilter('all')} />
                  </Badge>
                )}
                {stockStatusFilter !== 'all' && (
                  <Badge variant="outline" className="gap-1">
                    Status: {stockStatusFilter}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setStockStatusFilter('all')} />
                  </Badge>
                )}
                {sizeFilter !== 'all' && (
                  <Badge variant="outline" className="gap-1">
                    Size: {sizeFilter}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSizeFilter('all')} />
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
          <div className="rounded-md border overflow-x-auto">
            <Table>
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
                          className={`flex items-center gap-1 w-fit text-white ${
                            material.status === 'In Stock'
                              ? 'bg-green-600 hover:bg-green-700'
                              : material.status === 'Low Stock'
                              ? 'bg-red-700 hover:bg-red-800'
                              : 'bg-red-600 hover:bg-red-700'
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
                            >
                              <Edit className="h-4 w-4 text-orange-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(material)}
                              className="hover:bg-red-50"
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
              <Label>Material Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Steel Rebars 12mm"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Steel"
              />
            </div>
            <div className="space-y-2">
              <Label>Size</Label>
              <Input
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                placeholder="e.g., 12mm, 10kg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Input
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g., pcs, bags"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Minimum Quantity</Label>
              <Input
                type="number"
                value={formData.minQuantity}
                onChange={(e) => setFormData({ ...formData, minQuantity: Number(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} className="bg-yellow-500 hover:bg-yellow-600 text-stone-950">Add Material</Button>
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
              <Label>Material Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Size</Label>
              <Input
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Input
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Minimum Quantity</Label>
              <Input
                type="number"
                value={formData.minQuantity}
                onChange={(e) => setFormData({ ...formData, minQuantity: Number(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} className="bg-yellow-500 hover:bg-yellow-600 text-stone-950">Save Changes</Button>
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