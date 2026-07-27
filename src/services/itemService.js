import { supabase } from './supabase'

export const itemService = {
  async getItems(userId, page = 1, limit = 10, search = '', category = 'Semua', status = 'all') {
    try {
      let targetUserId = userId
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser()
        targetUserId = user?.id
      }

      let query = supabase
        .from('items')
        .select('*', { count: 'exact' })

      if (targetUserId) {
        query = query.eq('user_id', targetUserId)
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,sku.ilike.%${search}%`)
      }

      if (category && category !== 'Semua') {
        query = query.eq('category', category)
      }

      if (status === 'low') {
        query = query.gt('stock', 0).lt('stock', 2)
      } else if (status === 'out') {
        query = query.eq('stock', 0)
      }

      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error

      // Simpan data sukses ke localStorage sebagai cadangan offline
      if (data) {
        localStorage.setItem('cached_items', JSON.stringify(data))
      }

      return { data: data || [], count: count || 0 }
    } catch (err) {
      // Jika koneksi internet terputus, ambil data dari cache lokal browser
      console.warn('Koneksi internet bermasalah, memuat data dari cache lokal...', err.message)
      const cachedData = JSON.parse(localStorage.getItem('cached_items') || '[]')
      return { data: cachedData, count: cachedData.length }
    }
  },

  async createItem(item) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Pengguna tidak terautentikasi. Silakan login kembali.')

    const itemToInsert = {
      ...item,
      user_id: user.id
    }

    const { data, error } = await supabase.from('items').insert([itemToInsert]).select()
    if (error) throw error
    return data[0]
  },

  async updateItem(id, updates) {
    const { data, error } = await supabase.from('items').update(updates).eq('id', id).select()
    if (error) throw error
    return data[0]
  },

  async deleteItem(id) {
    const { error } = await supabase.from('items').delete().eq('id', id)
    if (error) throw error
    return true
  }
}