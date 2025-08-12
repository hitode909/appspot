onSuccess = (midiAccess) ->
  setup(midiAccess)

onFailure = (msg) ->
  document.querySelector('.items').style.display = 'none'
  document.querySelector('.error-message').style.display = 'block'

if navigator.requestMIDIAccess
  navigator.requestMIDIAccess().then(onSuccess, onFailure)
else
  onFailure()

setup = (midi)->
  midi.inputs.forEach (input) ->
    input.onmidimessage = onMessage

  window.requestAnimationFrame render

view =
  position: 0
  angles: [0, 0]
  speeds: [0, 0]

onMessage = (event) ->
  data = event.data

  if data[0] == 182
    view.position = data[2]

  if data[0] == 183
    scratch 0, data[2]
  if data[0] == 184
    scratch 1, data[2]

# ab: a:0 b:1
# value: 1:forward 127:back
scratch = (ab, value) ->
  view.speeds[ab] += (if value is 1 then 1 else -1)

bread = document.querySelector('#bread')
onigiri = document.querySelector('#onigiri')

render = () ->
  view.angles[0] += view.speeds[0]
  view.angles[1] += view.speeds[1]
  view.speeds[0] *= 0.99
  view.speeds[1] *= 0.99

  bread.style.width = (127-view.position) * 8 + 'px'
  onigiri.style.width = view.position * 8 + 'px'
  bread.style.transform = 'rotate(' + Math.floor(view.angles[0]) + 'deg)'
  onigiri.style.transform = 'rotate(' + Math.floor(view.angles[1]) + 'deg)'

  window.requestAnimationFrame render
