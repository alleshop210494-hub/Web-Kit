import { supabase } from './supabase'

export const itemService = {
  // Mengambil item otomatis berdasarkan user yang sedang login
  async getItems(userId) {
    let targetUserId = userId
    if (!targetUserId) {
      const { data: { user } } = await supabase.auth.getUser()
      targetUserId = user?.id
    }

    let query = supabase.from('items').select('*')
    if (targetUserId) {
      query = query.eq('user_id', targetUserId)
    }
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  // Menyimpan item baru dengan menyisipkan user_id secara otomatis dari sesi aktif
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