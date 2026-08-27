import { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'

function UserTimeChart({ usersTime }) {
  const canvasRef = useRef(null)
  const chartInstanceRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)
    const counts = Array(24).fill(0)

    if (Array.isArray(usersTime)) {
      usersTime.forEach((isoDate) => {
        const d = new Date(isoDate)
        const hour = d.getHours()
        if (!isNaN(hour) && hour >= 0 && hour < 24) {
          counts[hour] += 1
        }
      })
    }

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy()
    }

    const ctx = canvasRef.current.getContext('2d')
    const gradient = ctx.createLinearGradient(0, 0, 0, 260)
    gradient.addColorStop(0, 'rgba(234, 211, 92, 0.35)')
    gradient.addColorStop(1, 'rgba(234, 211, 92, 0.0)')

    chartInstanceRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: hours,
        datasets: [
          {
            label: 'Нові користувачі',
            data: counts,
            borderColor: '#ead35c',
            backgroundColor: gradient,
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#ead35c',
            pointBorderColor: '#1d1d1b',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 7,
            pointHoverBackgroundColor: '#f6de66',
            pointHoverBorderColor: '#10110f',
            pointHoverBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: '#1d1d1b',
            titleColor: '#f7f5ed',
            bodyColor: '#ead35c',
            borderColor: '#33332e',
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
            usePointStyle: true,
            callbacks: {
              title: (items) => `Час: ${items[0]?.label || ''}`,
              label: (context) => `Нових користувачів: ${context.parsed.y}`,
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: '#262624',
            },
            ticks: {
              color: '#92948b',
              font: {
                family: "'DM Sans', sans-serif",
                size: 11,
              },
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 12,
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: '#262624',
            },
            ticks: {
              color: '#92948b',
              font: {
                family: "'DM Sans', sans-serif",
                size: 11,
              },
              stepSize: 1,
              precision: 0,
            },
          },
        },
      },
    })

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
      }
    }
  }, [usersTime])

  return (
    <div className="chart-canvas-wrapper" style={{ position: 'relative', height: '280px', width: '100%' }}>
      <canvas ref={canvasRef} />
    </div>
  )
}

export default UserTimeChart
