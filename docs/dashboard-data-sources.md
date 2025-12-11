# 📊 Banco de Datos para Dashboards - SumarMas

Este documento detalla todas las fuentes de datos disponibles para los dashboards de **Administrador** y **Organización**, incluyendo qué datos se pueden filtrar por fecha.

---

## 🔌 Servicios Disponibles

| Servicio | Endpoints Principales | Rol |
|----------|----------------------|-----|
| `DonationService` | `getDonationsByCampaign(campaignId, status?)` | Org/Admin |
| `CampaignService` | `filter(state?, categories?, tags?, ngoId?)` | Org/Admin |
| `OrganizationService` | `getAllOrganizations()`, `getMyOrganizations()` | Admin/Org |
| `PayoutService` | `getMyPayouts()`, `payoutsPending()`, `getPayoutsByNgoId()` | Org/Admin |
| `CategoryService` | `getAllCategories()` | Admin/Org |
| `UserService` | `getById()` | Admin |

---

## 📋 Modelos de Datos

### 1. **Donación (`GetDonationDto`)**

```typescript
{
  donation_id: string;
  campaign_id: string;
  donor_id: string;
  payment_id: string;
  payment_proof: string;
  amount: number;
  currency: string;
  status: 'CREATED' | 'CONFIRMED' | 'PAID' | 'CANCELLED';
  payment_method: string;
  payment_datetime: Date | string | number[];  // ⏰ FILTRABLE POR FECHA
  created_at: Date | string | number[];        // ⏰ FILTRABLE POR FECHA
  campaign_data: {
    id: string;
    ngo: { ngoId, name, ... };
    title: string;
    goal_amount: number;
    current_amount: number;
    categories: CategoryDto[];
    campaign_state: string;
    ...
  };
}
```

**Campos para filtrar por fecha:**
- ✅ `payment_datetime` - Cuándo se pagó la donación
- ✅ `created_at` - Cuándo se creó la donación

**Agrupaciones posibles:**
- Por `campaign_id` → Donaciones por campaña
- Por `campaign_data.ngo.ngoId` → Donaciones por organización
- Por `campaign_data.categories` → Donaciones por categoría
- Por `status` → Donaciones por estado
- Por `payment_method` → Donaciones por método de pago

---

### 2. **Campaña (`GetCampaignDto`)**

```typescript
{
  id: string;
  ngo: GetOrganizationDto;
  title: string;
  goal_amount: number;
  current_amount: number;
  description: string;
  create_date_time: Date | string;  // ⏰ FILTRABLE POR FECHA
  end_date_time: Date | string;     // ⏰ FILTRABLE POR FECHA
  campaign_state: 'ACTIVE' | 'CLOSED';
  categories: CategoryDto[];
  tags: string[];
  images: string[];
}
```

**Campos para filtrar por fecha:**
- ✅ `create_date_time` - Cuándo se creó la campaña
- ✅ `end_date_time` - Cuándo terminó/terminará la campaña

**Agrupaciones posibles:**
- Por `ngo.ngoId` → Campañas por organización
- Por `campaign_state` → Campañas activas vs cerradas
- Por `categories` → Campañas por categoría

---

### 3. **Organización (`GetOrganizationDto`)**

```typescript
{
  ngoId: string;
  userCreator: GetUserDto;
  name: string;
  description: string;
  profileFileId: string;
  bannerFileId: string;
  documentsId: string[];
  images: CarrouselImage[];
  status: 'VERIFIED' | 'PENDING' | 'DENIED';
  createdDateTime: string;  // ⏰ FILTRABLE POR FECHA
  reasonDenied?: string;
}
```

**Campos para filtrar por fecha:**
- ✅ `createdDateTime` - Cuándo se registró la organización

**Agrupaciones posibles:**
- Por `status` → Organizaciones por estado de verificación

---

### 4. **Solicitud de Pago (`PayoutDto`)**

```typescript
{
  payout_request_id: string;
  ngo_id: string;
  amount: number;
  status: 'PENDING' | 'APPROVED';
  proof_file_id: string | null;
  request_datetime: Date;   // ⏰ FILTRABLE POR FECHA
  approval_datetime: Date;  // ⏰ FILTRABLE POR FECHA
  donations: {
    payout_request_id: string;
    donation_id: string;
    campaign_id: string;
    amount: number;
  }[];
}
```

**Campos para filtrar por fecha:**
- ✅ `request_datetime` - Cuándo se solicitó el pago
- ✅ `approval_datetime` - Cuándo se aprobó el pago

**Agrupaciones posibles:**
- Por `status` → Payouts pendientes vs aprobados
- Por `ngo_id` → Payouts por organización

---

### 5. **Categoría (`CategoryDto`)**

```typescript
{
  id: string;
  name: string;
  description: string;
}
```

⚠️ **Sin campo de fecha** - Las categorías son estáticas y no se filtran por fecha.

---

## 📈 Métricas Disponibles por Dashboard

### 🔷 Dashboard ADMIN (Plataforma completa)

| Métrica | Fuente | Filtrable por Fecha | Cálculo |
|---------|--------|---------------------|---------|
| **Total ONGs** | `getAllOrganizations()` | ✅ `createdDateTime` | `count()` |
| **ONGs por Estado** | `getAllOrganizations()` | ✅ `createdDateTime` | `groupBy(status)` |
| **ONGs Nuevas en Período** | `getAllOrganizations()` | ✅ `createdDateTime` | `filter(date).count()` |
| **Total Campañas** | `filter()` | ✅ `create_date_time` | `count()` |
| **Campañas Activas/Cerradas** | `filter(state)` | ✅ `create_date_time` | `groupBy(state)` |
| **Total Recaudado** | `filter() + current_amount` | ⚠️ Indirecto* | `sum(current_amount)` |
| **Recaudación por Categoría** | `filter() + categories` | ✅ `create_date_time` | `groupBy(category).sum(current_amount)` |
| **Top 5 ONGs por Campañas** | `filter() + ngoId` | ✅ `create_date_time` | `groupBy(ngo).count().top(5)` |
| **Top 5 ONGs por Donaciones** | `filter() + current_amount` | ✅ `create_date_time` | `groupBy(ngo).sum(current_amount).top(5)` |
| **Payouts Pendientes** | `payoutsPending()` | ✅ `request_datetime` | `count()` |

> *El `current_amount` no tiene fecha propia, pero se puede filtrar usando la fecha de la campaña.

---

### 🔶 Dashboard ORGANIZACIÓN (Solo mi organización)

| Métrica | Fuente | Filtrable por Fecha | Cálculo |
|---------|--------|---------------------|---------|
| **Mis Campañas** | `filter(ngoId=myNgoId)` | ✅ `create_date_time` | `count()` |
| **Campañas Activas** | `filter(state='ACTIVE', ngoId)` | ✅ `create_date_time` | `count()` |
| **Total Donaciones** | `getDonationsByCampaign()` | ✅ `payment_datetime` | `count()` |
| **Total Recaudado** | `getDonationsByCampaign(status='PAID')` | ✅ `payment_datetime` | `sum(amount)` |
| **Promedio por Donación** | Donaciones | ✅ `payment_datetime` | `avg(amount)` |
| **Recaudación por Categoría** | Campañas + Donaciones | ✅ `payment_datetime` | `groupBy(category).sum(amount)` |
| **Top 5 Campañas** | Campañas + Donaciones | ✅ `payment_datetime` | `groupBy(campaign).sum(amount).top(5)` |
| **Progreso de Campaña** | Campaña específica | N/A | `current_amount / goal_amount` |
| **Mis Payouts** | `getMyPayouts()` | ✅ `request_datetime` | `groupBy(status).count()` |
| **Donaciones por Día/Mes** | Donaciones | ✅ `payment_datetime` | `groupBy(date).count()` |

---

## ⏰ Lógica de Filtrado por Fecha

### Filtros Disponibles

```typescript
type DateFilter = '7d' | '30d' | '3m' | '1y';

function getStartDate(filter: DateFilter): Date {
  const now = new Date();
  switch (filter) {
    case '7d':  return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '3m':  return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case '1y':  return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  }
}
```

### Formato de Fechas del Backend

El backend devuelve fechas en **múltiples formatos**:

```typescript
// Formato 1: Array de números [año, mes, día, hora, minuto, segundo]
payment_datetime: [2025, 11, 22, 14, 30, 0]

// Formato 2: String ISO
createdDateTime: "2025-11-22T14:30:00"

// Formato 3: Date object (raro)
end_date_time: Date
```

**Función de conversión universal:**

```typescript
function parseDate(date: Date | string | number[] | null): Date | null {
  if (!date) return null;
  
  if (Array.isArray(date)) {
    if (date.length < 3) return null;
    return new Date(
      date[0],        // año
      date[1] - 1,    // mes (0-indexed)
      date[2],        // día
      date[3] || 0,   // hora
      date[4] || 0,   // minuto
      date[5] || 0    // segundo
    );
  }
  
  return new Date(date);
}
```

---

## 🗺️ Flujo de Datos Recomendado

### Dashboard Admin

```
┌─────────────────────────────────────────────────────────────┐
│                      CARGA INICIAL                          │
├─────────────────────────────────────────────────────────────┤
│  1. getAllOrganizations() ────────────► allNGOs             │
│  2. filter() ──────────────────────────► allCampaigns       │
│  3. getAllCategories() ────────────────► allCategories      │
│  4. payoutsPending() ──────────────────► pendingPayouts     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│               FILTRADO POR FECHA (en frontend)              │
├─────────────────────────────────────────────────────────────┤
│  - filteredNGOs = allNGOs.filter(createdDateTime >= start)  │
│  - filteredCampaigns = allCampaigns.filter(create_date >= s)│
│  - filteredPayouts = pendingPayouts.filter(request_date >= s│
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    CÁLCULO DE MÉTRICAS                      │
├─────────────────────────────────────────────────────────────┤
│  - ngosByStatus = groupBy(filteredNGOs, 'status')           │
│  - recaudacionByCategory = campañas × categorías            │
│  - top5NGOsByCampaigns = groupBy + sort + slice(5)          │
│  - top5NGOsByDonations = groupBy + sum + sort + slice(5)    │
└─────────────────────────────────────────────────────────────┘
```

### Dashboard Organización

```
┌─────────────────────────────────────────────────────────────┐
│                      CARGA INICIAL                          │
├─────────────────────────────────────────────────────────────┤
│  1. getMyOrganizations() ──────────────► myOrg              │
│  2. filter(ngoId=myOrg.ngoId) ─────────► myCampaigns        │
│  3. getDonationsByCampaign(c.id, 'PAID')► allDonations      │
│     (para cada campaña, en paralelo)                        │
│  4. getAllCategories() ────────────────► allCategories      │
│  5. getMyPayouts() ────────────────────► myPayouts          │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│           FILTRADO POR FECHA (en frontend)                  │
├─────────────────────────────────────────────────────────────┤
│  filteredDonations = allDonations.filter(                   │
│    payment_datetime >= startDate &&                         │
│    payment_datetime <= now                                  │
│  )                                                          │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    CÁLCULO DE MÉTRICAS                      │
├─────────────────────────────────────────────────────────────┤
│  - totalDonations = filteredDonations.length                │
│  - totalAmount = sum(filteredDonations.amount)              │
│  - avgDonation = totalAmount / totalDonations               │
│  - categoriesData = groupBy(category).sum(amount)           │
│  - top5Campaigns = groupBy(campaign).sum(amount).top(5)     │
│  - payoutsByStatus = groupBy(myPayouts, 'status')           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Gráficos Recomendados

### Dashboard Admin

| Gráfico | Tipo | Datos | Filtrable |
|---------|------|-------|-----------|
| ONGs por Estado | Bar (vertical) | VERIFIED, PENDING, DENIED | ✅ |
| Recaudación por Categoría | Bar (horizontal) | categoría → monto | ✅ |
| Top 5 ONGs por Campañas | Tabla | nombre, cantidad | ✅ |
| Top 5 ONGs por Donaciones | Tabla | nombre, monto | ✅ |
| ~~Evolución de Recaudación~~ | ~~Line~~ | ~~No disponible sin histórico~~ | ❌ |

### Dashboard Organización

| Gráfico | Tipo | Datos | Filtrable |
|---------|------|-------|-----------|
| Progreso de Campaña | Doughnut | recaudado vs faltante | ❌ (single) |
| Recaudación por Categoría | Bar (horizontal) | categoría → monto | ✅ |
| Top 5 Campañas | Tabla | nombre, donaciones, monto | ✅ |
| Donaciones en el Tiempo | Line | fecha → cantidad | ✅ |
| ~~Métodos de Pago~~ | ~~Pie~~ | ~~No disponible aún~~ | ❌ |

---

## ⚠️ Limitaciones Actuales

### Datos NO disponibles vía API:

1. **Usuarios totales** - No hay endpoint `/users/all`
2. **Usuarios nuevos** - No hay forma de listar usuarios con fecha
3. **Donaciones totales de la plataforma** - Solo se pueden obtener por campaña
4. **Histórico de recaudación** - Solo se tiene el `current_amount` actual
5. **Métodos de pago agrupados** - El campo existe pero no hay endpoint de agregación
6. **Donaciones por día/hora** - Hay que agrupar manualmente en frontend

### Workarounds implementados:

| Dato Faltante | Workaround |
|---------------|------------|
| Total donaciones | Sumar `current_amount` de todas las campañas |
| Donaciones por NGO | Obtener campañas de la NGO → sumar `current_amount` |
| Cantidad de donaciones | Estimar: `current_amount / 500` (promedio asumido) |

---

## 🎯 Conclusión

### Para el Dashboard Admin necesitamos:
1. `allNGOs` → filtrar por `createdDateTime`
2. `allCampaigns` → filtrar por `create_date_time`
3. `allCategories` → sin filtro
4. `pendingPayouts` → filtrar por `request_datetime`

### Para el Dashboard Organización necesitamos:
1. `myCampaigns` → de mi organización
2. `allDonations` → todas las donaciones de mis campañas, filtrar por `payment_datetime`
3. `allCategories` → sin filtro
4. `myPayouts` → filtrar por `request_datetime`

### La clave está en:
- **Cargar TODOS los datos una vez** al iniciar
- **Filtrar en el frontend** según el período seleccionado
- **No hacer llamadas adicionales** al cambiar filtros
- **Manejar fallbacks** cuando el API falla (usar `current_amount`)
