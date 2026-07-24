import { supabase } from './supabase'

export const itemService = {
  // 1. READ: Mengambil semua data dari tabel items
  async getItems() {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  // 2. CREATE: Menambah data baru ke tabel items
  async createItem(item) {
    const { data, error } = await supabase
      .from('items')
      .insert([item])
      .select()
    if (error) throw error
    return data[0]
  },

  // 3. UPDATE: Memperbarui data berdasarkan ID
  async updateItem(id, updates) {
    const { data, error } = await supabase
      .from('items')
      .update(updates)
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },

  // 4. DELETE: Menghapus data berdasarkan ID
  async deleteItem(id) {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id)
    if (error) throw error
    return true
  }
}