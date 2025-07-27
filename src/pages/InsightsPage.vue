<template>
  <q-page class="insights-bg q-pa-md">
    <div class="insights-container" v-if="!loading">
      <!-- Top Stats Cards Row -->
      <div class="row q-col-gutter-md q-mb-lg">
        <!-- Monthly Spending Card -->
        <div class="col-12 col-md-4">
          <q-card class="stats-card">
            <q-card-section>
              <div class="text-subtitle1 text-grey-7">Monthly Spending</div>
              <div class="text-h4 q-mt-sm text-weight-bold">
                ₹{{ formatCurrency(currentMonthSpending) }}
              </div>
              <div class="trend-indicator q-mt-xs" :class="spendingTrend.color">
                <q-icon :name="spendingTrend.icon" size="16px" />
                <span class="q-ml-xs">{{ spendingTrend.text }}</span>
              </div>
            </q-card-section>
            <div class="stats-icon bg-green-7">
              <q-icon name="attach_money" color="white" size="24px" />
            </div>
          </q-card>
        </div>

        <!-- Receipts Processed Card -->
        <div class="col-12 col-md-4">
          <q-card class="stats-card">
            <q-card-section>
              <div class="text-subtitle1 text-grey-7">Receipts Processed</div>
              <div class="text-h4 q-mt-sm text-weight-bold">
                {{ totalReceipts }}
              </div>
              <div class="trend-indicator q-mt-xs text-positive">
                <q-icon name="trending_up" size="16px" />
                <span class="q-ml-xs">+23 this week</span>
              </div>
            </q-card-section>
            <div class="stats-icon bg-blue-7">
              <q-icon name="receipt_long" color="white" size="24px" />
            </div>
          </q-card>
        </div>

        <!-- Savings Potential Card -->
        <div class="col-12 col-md-4">
          <q-card class="stats-card">
            <q-card-section>
              <div class="text-subtitle1 text-grey-7">Savings Potential</div>
              <div class="text-h4 q-mt-sm text-weight-bold">
                ₹{{ formatCurrency(savingsPotential) }}
              </div>
              <div class="trend-indicator q-mt-xs text-grey-7">
                <span>AI identified</span>
              </div>
            </q-card-section>
            <div class="stats-icon bg-purple-7">
              <q-icon name="savings" color="white" size="24px" />
            </div>
          </q-card>
        </div>
      </div>

      <!-- Spending Trends Chart -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-lg-7">
          <q-card class="chart-card">
            <q-card-section class="q-pb-none">
              <div class="row items-center">
                <q-icon name="trending_up" color="green-7" size="24px" class="q-mr-sm" />
                <div class="text-h6 text-weight-medium">Spending Trends</div>
              </div>
            </q-card-section>
            
            <q-card-section>
              <q-tabs
                v-model="timeframe"
                class="text-grey"
                active-color="primary"
                indicator-color="primary"
                narrow-indicator
                dense
                align="left"
              >
                <q-tab name="daily" label="Daily" />
                <q-tab name="weekly" label="Weekly" />
                <q-tab name="monthly" label="Monthly" />
                <q-tab name="yearly" label="Yearly" />
              </q-tabs>
              
              <div class="chart-container q-mt-md" style="height: 300px;">
                <canvas ref="spendingTrendsChartRef"></canvas>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Monthly Categories Pie Chart -->
        <div class="col-12 col-lg-5">
          <q-card class="chart-card">
            <q-card-section class="q-pb-none">
              <div class="row items-center">
                <q-icon name="donut_large" color="green-7" size="24px" class="q-mr-sm" />
                <div class="text-h6 text-weight-medium">This Month's Categories</div>
              </div>
            </q-card-section>

            <q-card-section>
              <div class="chart-container q-mt-md" style="height: 300px;">
                <canvas ref="categoriesPieChartRef"></canvas>
              </div>
            </q-card-section>

            <!-- Category Legend -->
            <q-card-section>
              <div class="categories-legend">
                <div v-for="(category, index) in categoryData" :key="index" class="category-item">
                  <div class="category-dot" :style="{ backgroundColor: categoryColors[index % categoryColors.length] }"></div>
                  <div class="category-name">{{ category.name }}</div>
                  <div class="category-amount">₹{{ formatCurrency(category.total_spend) }}</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="full-width flex flex-center" style="height: 400px;">
      <q-spinner-dots color="primary" size="80px" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import secureAxios from 'src/boot/secureAxios';
import Chart from 'chart.js/auto';

// State variables
const loading = ref(true);
const timeframe = ref('monthly');
const insightsData = ref(null);
const savingsPotential = ref(284.50); // Hardcoded from screenshot

// Chart refs - use these for DOM elements
const spendingTrendsChartRef = ref(null);
const categoriesPieChartRef = ref(null);

// Chart instances - use these for Chart.js objects
let spendingChart = null;
let pieChart = null;

// Colors for the charts
const categoryColors = [
  '#1abc9c', '#3498db', '#f39c12', '#9b59b6', '#e74c3c',
  '#2ecc71', '#34495e', '#16a085', '#2980b9', '#f1c40f'
];

// Computed properties
const totalReceipts = computed(() => {
  return insightsData.value?.total?.[0]?.count || 0;
});

const currentMonthSpending = computed(() => {
  if (!insightsData.value?.monthly) return 0;
  
  // Get the latest month's data
  const latestMonth = insightsData.value.monthly[0];
  return latestMonth ? latestMonth.total_spend : 0;
});

const categoryData = computed(() => {
  return insightsData.value?.monthly_pie || [];
});

// Calculate spending trend compared to previous month
const spendingTrend = computed(() => {
  if (!insightsData.value?.monthly || insightsData.value.monthly.length < 2) {
    return { text: '0%', icon: 'trending_flat', color: 'text-grey-7' };
  }
  
  const currentMonth = insightsData.value.monthly[0].total_spend;
  const previousMonth = insightsData.value.monthly[1].total_spend;
  
  if (previousMonth === 0) return { text: '0%', icon: 'trending_flat', color: 'text-grey-7' };
  
  const percentChange = ((currentMonth - previousMonth) / previousMonth) * 100;
  const formattedPercent = percentChange.toFixed(1);
  
  if (percentChange > 0) {
    return { 
      text: `+${formattedPercent}%`, 
      icon: 'trending_up', 
      color: 'text-negative'  // Red for increased spending
    };
  } else if (percentChange < 0) {
    return { 
      text: `${formattedPercent}%`, 
      icon: 'trending_down', 
      color: 'text-positive' // Green for decreased spending
    };
  }
  
  return { text: '0%', icon: 'trending_flat', color: 'text-grey-7' };
});

// Format currency values
function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  }).format(value);
}

// Fetch insights data
async function fetchInsightsData() {
  loading.value = true;
  try {
    const response = await secureAxios.get('/trends/daily');
    insightsData.value = response.data;
    renderCharts();
  } catch (error) {
    console.error('Error fetching insights data:', error);
  } finally {
    loading.value = false;
  }
}

// Render charts based on data
function renderCharts() {
  // Add a slight delay to ensure DOM is ready
  setTimeout(() => {
    renderSpendingChart();
    renderCategoriesPieChart();
  }, 100);
}

// Render spending trends chart
function renderSpendingChart() {
  if (spendingChart) {
    spendingChart.destroy();
  }

  // Add null check to prevent errors
  if (!spendingTrendsChartRef.value) {
    console.error('Spending chart canvas not found');
    return;
  }

  const ctx = spendingTrendsChartRef.value.getContext('2d');
  let labels = [];
  let data = [];
  
  // Check if the context exists
  if (!ctx) {
    console.error('Failed to get 2D context for spending chart');
    return;
  }
  
  let gradientFill = ctx.createLinearGradient(0, 0, 0, 350);
  gradientFill.addColorStop(0, 'rgba(46, 204, 113, 0.6)');
  gradientFill.addColorStop(1, 'rgba(46, 204, 113, 0.1)');

  // Safety check for data
  if (!insightsData.value) {
    console.error('No insights data available');
    return;
  }

  // Generate data based on selected timeframe
  if (timeframe.value === 'daily' && insightsData.value.daily) {
    labels = insightsData.value.daily.map(item => {
      const date = new Date(item.period);
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    });
    data = insightsData.value.daily.map(item => item.total_spend);
  } else if (timeframe.value === 'monthly' && insightsData.value.monthly) {
    labels = insightsData.value.monthly.map(item => item.month_name);
    data = insightsData.value.monthly.map(item => item.total_spend);
  } else if (timeframe.value === 'yearly' && insightsData.value.yearly) {
    labels = insightsData.value.yearly.map(item => item.year);
    data = insightsData.value.yearly.map(item => item.total_spend);
  }

  // For weekly, calculate from daily data or request it from backend
  if (timeframe.value === 'weekly' && insightsData.value.daily && insightsData.value.daily.length > 0) {
    // This is a simplified version - in a real app, properly group days into weeks
    const weeks = [];
    for (let i = 0; i < insightsData.value.daily.length; i += 7) {
      const weekData = insightsData.value.daily.slice(i, i + 7);
      if (weekData.length > 0) {
        const total = weekData.reduce((sum, day) => sum + day.total_spend, 0);
        const startDate = new Date(weekData[0].period);
        const endDate = new Date(weekData[weekData.length-1].period);
        weeks.push({
          label: `${startDate.toLocaleDateString('en-US', {day: 'numeric', month: 'short'})} - ${endDate.toLocaleDateString('en-US', {day: 'numeric', month: 'short'})}`,
          total
        });
      }
    }
    labels = weeks.map(week => week.label);
    data = weeks.map(week => week.total);
  }

  // Configure and create chart
  spendingChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Spending',
        data,
        backgroundColor: gradientFill,
        borderColor: '#2ecc71',
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `₹${formatCurrency(context.parsed.y)}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '₹' + formatCurrency(value);
            }
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}

// Render categories pie chart
function renderCategoriesPieChart() {
  if (pieChart) {
    pieChart.destroy();
  }

  // Add null check
  if (!categoriesPieChartRef.value) {
    console.error('Categories chart canvas not found');
    return;
  }

  const ctx = categoriesPieChartRef.value.getContext('2d');
  
  // Check if the context exists
  if (!ctx) {
    console.error('Failed to get 2D context for categories chart');
    return;
  }
  
  // Safety check for data
  if (!insightsData.value || !insightsData.value.monthly_pie) {
    console.error('No category data available');
    return;
  }
  
  const data = insightsData.value.monthly_pie || [];
  
  pieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(item => item.name),
      datasets: [{
        data: data.map(item => item.total_spend),
        backgroundColor: categoryColors.slice(0, data.length),
        hoverOffset: 4,
        borderWidth: 1,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.raw;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `₹${formatCurrency(value)} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

// Watch for timeframe changes to update chart
watch(timeframe, () => {
  if (insightsData.value) {
    renderSpendingChart();
  }
});

// Initialize on component mount
onMounted(async () => {
  await fetchInsightsData();
});
</script>

<style scoped>
.insights-bg {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.insights-container {
  max-width: 1400px;
  margin: 0 auto;
}

.stats-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  height: 100%;
}

.stats-icon {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-card {
  border-radius: 12px;
  height: 100%;
}

.trend-indicator {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  font-weight: 500;
}

.categories-legend {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.category-item {
  display: flex;
  align-items: center;
}

.category-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
}

.category-name {
  flex: 1;
  font-size: 0.9rem;
}

.category-amount {
  font-weight: 600;
  font-size: 0.9rem;
}

@media (max-width: 600px) {
  .stats-card {
    margin-bottom: 16px;
  }
  
  .chart-card {
    margin-bottom: 16px;
  }
}
</style>