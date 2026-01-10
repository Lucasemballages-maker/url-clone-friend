import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, Star, Trash2, CreditCard, ExternalLink } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { StoreData, ProductReview } from "@/types/store";

interface DeployedStore {
  id: string;
  subdomain: string;
  store_data: StoreData;
  status: string;
  payment_url: string | null;
}

const StoreEditor = () => {
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId: string }>();
  const { user, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [store, setStore] = useState<DeployedStore | null>(null);
  
  // Form state
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#4A90E2");
  const [accentColor, setAccentColor] = useState("#764ba2");
  const [headline, setHeadline] = useState("");
  const [cta, setCta] = useState("");
  const [benefits, setBenefits] = useState("");
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [showCountdown, setShowCountdown] = useState(true);
  const [showReviews, setShowReviews] = useState(true);
  const [showBadges, setShowBadges] = useState(true);
  const [paymentUrl, setPaymentUrl] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user && storeId) {
      fetchStore();
    }
  }, [user, authLoading, storeId]);

  const fetchStore = async () => {
    try {
      const { data, error } = await supabase
        .from("deployed_stores")
        .select("*")
        .eq("id", storeId)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast.error("Boutique non trouvée");
        navigate("/dashboard/apps");
        return;
      }

      const storeData = data.store_data as unknown as StoreData;
      setStore({
        ...data,
        store_data: storeData,
        payment_url: data.payment_url,
      });
      setPaymentUrl(data.payment_url || "");

      // Populate form
      setProductName(storeData.productName || "");
      setDescription(storeData.description || "");
      setPrice(storeData.productPrice || "");
      setOriginalPrice(storeData.originalPrice || "");
      setPrimaryColor(storeData.primaryColor || "#4A90E2");
      setAccentColor(storeData.accentColor || "#764ba2");
      setHeadline(storeData.headline || "");
      setCta(storeData.cta || "");
      setBenefits(storeData.benefits?.join("\n") || "");
      setReviews(storeData.customerReviews || [
        { name: "Marie C.", initials: "MC", text: "Excellent produit !", rating: 5 },
        { name: "Jean D.", initials: "JD", text: "Très satisfait", rating: 5 },
        { name: "Sophie L.", initials: "SL", text: "Je recommande", rating: 5 },
      ]);
    } catch (err) {
      console.error("Error fetching store:", err);
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!store) return;

    setSaving(true);
    try {
      const updatedStoreData: StoreData = {
        ...store.store_data,
        productName,
        description,
        productPrice: price,
        originalPrice,
        primaryColor,
        accentColor,
        headline,
        cta,
        benefits: benefits.split("\n").filter(b => b.trim()),
        customerReviews: reviews,
      };

      const { error } = await supabase
        .from("deployed_stores")
        .update({ 
          store_data: JSON.parse(JSON.stringify(updatedStoreData)),
          payment_url: paymentUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", store.id);

      if (error) throw error;

      toast.success("✅ Modifications sauvegardées");
      setStore({ ...store, store_data: updatedStoreData });
    } catch (err) {
      console.error("Error saving:", err);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const updateReview = (index: number, field: keyof ProductReview, value: string | number) => {
    const newReviews = [...reviews];
    newReviews[index] = { ...newReviews[index], [field]: value };
    if (field === 'name') {
      newReviews[index].initials = (value as string).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    setReviews(newReviews);
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!store) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/apps")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Modifier la boutique</h1>
            <p className="text-muted-foreground text-sm">{store.subdomain}.dropyfy.app</p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Sauvegarder
          </Button>
        </div>

        <div className="space-y-6">
          {/* Product Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations produit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="productName">Nom du produit</Label>
                <Input 
                  id="productName" 
                  value={productName} 
                  onChange={(e) => setProductName(e.target.value)} 
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Prix (€)</Label>
                  <Input 
                    id="price" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                  />
                </div>
                <div>
                  <Label htmlFor="originalPrice">Prix barré (€)</Label>
                  <Input 
                    id="originalPrice" 
                    value={originalPrice} 
                    onChange={(e) => setOriginalPrice(e.target.value)} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Design */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Design</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Couleur primaire</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="color" 
                      id="primaryColor" 
                      value={primaryColor} 
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input 
                      value={primaryColor} 
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="accentColor">Couleur secondaire</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="color" 
                      id="accentColor" 
                      value={accentColor} 
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input 
                      value={accentColor} 
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Texts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Textes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="headline">Titre hero</Label>
                <Input 
                  id="headline" 
                  value={headline} 
                  onChange={(e) => setHeadline(e.target.value)} 
                />
              </div>
              <div>
                <Label htmlFor="cta">Texte du bouton CTA</Label>
                <Input 
                  id="cta" 
                  value={cta} 
                  onChange={(e) => setCta(e.target.value)} 
                />
              </div>
              <div>
                <Label htmlFor="benefits">Liste des bénéfices (un par ligne)</Label>
                <Textarea 
                  id="benefits" 
                  value={benefits} 
                  onChange={(e) => setBenefits(e.target.value)}
                  rows={5}
                  placeholder="Qualité premium&#10;Livraison gratuite&#10;Garantie 30 jours"
                />
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Avis clients</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviews.map((review, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Avis #{index + 1}</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => updateReview(index, 'rating', star)}
                          className={`${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Nom</Label>
                      <Input 
                        value={review.name} 
                        onChange={(e) => updateReview(index, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Initiales</Label>
                      <Input 
                        value={review.initials} 
                        onChange={(e) => updateReview(index, 'initials', e.target.value)}
                        maxLength={2}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Texte</Label>
                    <Textarea 
                      value={review.text} 
                      onChange={(e) => updateReview(index, 'text', e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Payments Section */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">💳 Paiements de vos clients</CardTitle>
              </div>
              <CardDescription>
                Pour que vos visiteurs puissent acheter votre produit et que VOUS receviez l'argent directement, ajoutez le lien de votre page de paiement personnelle.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="paymentUrl">Lien de paiement (Stripe, PayPal, etc.)</Label>
                <Input 
                  id="paymentUrl" 
                  value={paymentUrl} 
                  onChange={(e) => setPaymentUrl(e.target.value)}
                  placeholder="https://buy.stripe.com/... ou https://paypal.me/votrenom"
                />
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium">💡 Exemples de liens acceptés :</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Stripe Payment Link : https://buy.stripe.com/test_xxxxx</li>
                  <li>• PayPal.me : https://paypal.me/monpseudo</li>
                  <li>• Lien de checkout personnalisé</li>
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <a 
                  href="https://dashboard.stripe.com/payment-links" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  📚 Créer un Stripe Payment Link <ExternalLink className="h-3 w-3" />
                </a>
                <a 
                  href="https://www.paypal.com/paypalme" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  📚 Créer un lien PayPal.me <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  ⚠️ <strong>Important :</strong> C'est VOTRE lien de paiement personnel, pas celui de Dropyfy. L'argent de vos ventes ira directement sur VOTRE compte.
                </p>
              </div>
              
              {paymentUrl && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                  <span className="text-green-600">✅</span>
                  <span className="text-sm text-green-700 dark:text-green-300">Lien de paiement configuré</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Paramètres avancés</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Activer le countdown</Label>
                  <p className="text-sm text-muted-foreground">Affiche un compteur d'urgence</p>
                </div>
                <Switch checked={showCountdown} onCheckedChange={setShowCountdown} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Afficher les avis clients</Label>
                  <p className="text-sm text-muted-foreground">Section témoignages</p>
                </div>
                <Switch checked={showReviews} onCheckedChange={setShowReviews} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Afficher les badges de confiance</Label>
                  <p className="text-sm text-muted-foreground">Paiement sécurisé, livraison...</p>
                </div>
                <Switch checked={showBadges} onCheckedChange={setShowBadges} />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button onClick={handleSave} disabled={saving} className="w-full gap-2" size="lg">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Sauvegarder les modifications
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StoreEditor;
