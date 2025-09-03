import json
import os

# Data dosyasını oku
data_path = r"c:\Users\1nadi\Yapay_Zeka\PsikOyun\public\data\benkimim_words_tr.json"

with open(data_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Ünlü psikologlar (kolay seviye) - herkesin duyduğu isimler
kolay_psikologlar = [
    "Sigmund Freud", "Carl G. Jung", "B.F. Skinner", "Jean Piaget", 
    "Albert Bandura", "Abraham H. Maslow", "Ivan P. Pavlov", 
    "Carl R. Rogers", "Erik H. Erikson", "John B. Watson",
    "Stanley Milgram", "Paul Ekman", "William James", "Alfred Adler",
    "John Bowlby", "Lawrence Kohlberg", "Wilhelm Wundt"
]

# Orta seviye - eğitim dünyasında bilinen teorisyenler  
orta_psikologlar = [
    "Leon Festinger", "Solomon E. Asch", "Stanley Schachter",
    "Edward Thorndike", "Gordon W. Allport", "Hans J. Eysenck",
    "David C. McClelland", "Raymond B. Cattell", "Kurt Lewin",
    "Donald O. Hebb", "George A. Miller", "Clark L. Hull",
    "Jerome Kagan", "Walter Mischel", "Harry F. Harlow",
    "J. P. Guilford", "Jerome S. Bruner", "Ernest R. Hilgard",
    "Martin E.P. Seligman", "Ulric Neisser", "Donald T. Campbell",
    "Roger Brown", "R.B. Zajonc", "Endel Tulving", "Herbert A. Simon",
    "Noam Chomsky", "Edward E. Jones", "Charles E. Osgood",
    "Gordon H. Bower", "Harold H. Kelley", "Roger W. Sperry",
    "Edward C. Tolman", "Wolfgang Köhler", "David Wechsler",
    "Joseph Wolpe", "Elizabeth F. Loftus", "Robert J. Sternberg",
    "Konrad Lorenz", "Alexander R. Luria", "Mary D. Ainsworth",
    "Anna Freud"
]

# Güncel datayi kategorize et
for item in data:
    kisi = item["kisi"]
    
    # Önce kolay kategorisinde mi kontrol et
    if any(kolay_kisi in kisi for kolay_kisi in kolay_psikologlar):
        item["zorluk"] = "kolay"
    # Sonra orta kategorisinde mi kontrol et  
    elif any(orta_kisi in kisi for orta_kisi in orta_psikologlar):
        item["zorluk"] = "orta"
    # Geri kalanlar zor kategorisi
    else:
        item["zorluk"] = "zor"

# Güncellenmiş data'yı kaydet
with open(data_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# İstatistikleri yazdır
kolay_sayisi = sum(1 for item in data if item.get("zorluk") == "kolay")
orta_sayisi = sum(1 for item in data if item.get("zorluk") == "orta") 
zor_sayisi = sum(1 for item in data if item.get("zorluk") == "zor")

print(f"Kategorize edildi:")
print(f"Kolay: {kolay_sayisi} psikolog")
print(f"Orta: {orta_sayisi} psikolog") 
print(f"Zor: {zor_sayisi} psikolog")
print(f"Toplam: {len(data)} psikolog")
print("\nData dosyası güncellendi!")
