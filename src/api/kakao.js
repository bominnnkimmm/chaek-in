export const searchBooks = async (query) => {
  const response = await fetch(
    `https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(query)}`,
    {
      headers: {
        Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_API_KEY}`
      }
    }
  )
  const data = await response.json()
  return data.documents
}