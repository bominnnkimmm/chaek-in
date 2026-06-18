import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/kakao': {
          target: 'https://dapi.kakao.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/kakao/, ''),
          headers: {
            Authorization: `KakaoAK ${env.VITE_KAKAO_API_KEY}`
          }
        }
      }
    }
  }
})