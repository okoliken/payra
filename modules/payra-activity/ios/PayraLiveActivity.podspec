Pod::Spec.new do |s|
  s.name           = 'PayraLiveActivity'
  s.version        = '1.0.0'
  s.summary        = 'Starts the Payra payment Live Activity'
  s.author         = ''
  s.homepage       = 'https://github.com/okoliken/payra'
  s.platforms      = { :ios => '16.4' }
  s.source         = { git: '' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.source_files = '**/*.swift'
end
