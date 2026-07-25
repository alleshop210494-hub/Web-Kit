import { supabase } from './supabase'

export const itemService = {
  // Mengambil item hanya milik user yang sedang login
  async getItems(userId) {
    let query = supabase.from('items').select('*')
    if (userId) {
      query = query.eq('user_id', userId)
    }
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async createItem(item) {
    const { data, error } = await supabase.from('items').insert([item]).select()
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