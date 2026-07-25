if (updateError) {
  setError('Gagal memperbarui password: ' + updateError.message)
} else {
  sessionStorage.removeItem('isResettingPassword') // Hapus tanda reset
  setMessage('Password berhasil diperbarui! Mengalihkan ke halaman login...')
  setTimeout(() => {
    navigate('/') 
  }, 2000)
}