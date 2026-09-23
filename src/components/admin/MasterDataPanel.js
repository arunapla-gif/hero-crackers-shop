import { useState } from 'react';
import ProductMaster from './master/ProductMaster';
import CategoryMaster from './master/CategoryMaster';
import GodownMaster from './master/GodownMaster';
import ReferenceMaster from './master/ReferenceMaster';
import TransportMaster from './master/TransportMaster';

export default function MasterDataPanel({ products, setProducts, categories, setCategories, godowns, setGodowns, references, setReferences, transports, setTransports }) {
  const [activeMasterTab, setActiveMasterTab] = useState('product');
  
  // Forms state
  const [categoryName, setCategoryName] = useState('');
  const [godownName, setGodownName] = useState('');
  const [godownLocation, setGodownLocation] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '', description: '', basePrice: '', price: '', discount: '', stockShop: '', categoryId: categories.length > 0 ? categories[0].id : '', imageUrl: '', sequence: '', packageString: ''
  });
  const [referenceName, setReferenceName] = useState('');
  const [referencePhone, setReferencePhone] = useState('');
  const [transportName, setTransportName] = useState('');
  const [transportPhone, setTransportPhone] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [isDragLocked, setIsDragLocked] = useState(true);
  
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingReferenceId, setEditingReferenceId] = useState(null);
  const [editingTransportId, setEditingTransportId] = useState(null);
  
  const [globalDiscount, setGlobalDiscount] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  return (
    <div className="admin-card">
      {/* Sub-navigation */}
      <div className="admin-pill-nav">
        {['product', 'category', 'godown', 'reference', 'transport'].map(tab => (
          <button 
            key={tab}
            className={`admin-pill-btn ${activeMasterTab === tab ? 'active' : ''}`}
            onClick={() => setActiveMasterTab(tab)} 
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} Master
          </button>
        ))}
      </div>

      {activeMasterTab === 'product' && (
        <ProductMaster 
          products={products} setProducts={setProducts} categories={categories}
          newProduct={newProduct} setNewProduct={setNewProduct} imageFile={imageFile} setImageFile={setImageFile}
          isUploading={isUploading} setIsUploading={setIsUploading} editingProductId={editingProductId} setEditingProductId={setEditingProductId}
          globalDiscount={globalDiscount} setGlobalDiscount={setGlobalDiscount} isApplyingDiscount={isApplyingDiscount} setIsApplyingDiscount={setIsApplyingDiscount}
          isDragLocked={isDragLocked} setIsDragLocked={setIsDragLocked} draggedItemIndex={draggedItemIndex} setDraggedItemIndex={setDraggedItemIndex}
        />
      )}

      {activeMasterTab === 'category' && (
        <CategoryMaster 
          categories={categories} setCategories={setCategories}
          categoryName={categoryName} setCategoryName={setCategoryName} editingCategoryId={editingCategoryId} setEditingCategoryId={setEditingCategoryId}
        />
      )}

      {activeMasterTab === 'godown' && (
        <GodownMaster 
          godowns={godowns} setGodowns={setGodowns} products={products}
          godownName={godownName} setGodownName={setGodownName} godownLocation={godownLocation} setGodownLocation={setGodownLocation}
        />
      )}

      {activeMasterTab === 'reference' && (
        <ReferenceMaster 
          references={references} setReferences={setReferences}
          referenceName={referenceName} setReferenceName={setReferenceName} referencePhone={referencePhone} setReferencePhone={setReferencePhone}
          editingReferenceId={editingReferenceId} setEditingReferenceId={setEditingReferenceId}
        />
      )}

      {activeMasterTab === 'transport' && (
        <TransportMaster 
          transports={transports} setTransports={setTransports}
          transportName={transportName} setTransportName={setTransportName} transportPhone={transportPhone} setTransportPhone={setTransportPhone}
          editingTransportId={editingTransportId} setEditingTransportId={setEditingTransportId}
        />
      )}
    </div>
  );
}
