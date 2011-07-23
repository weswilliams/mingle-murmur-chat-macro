require "parameters"
require 'erb'

module CustomMacro

  class MurmurChat
    include CustomMacro::Parameters

    def initialize(parameters, project, current_user)
      @project = project
      @current_user = current_user
      @parameters = Parameters::Parameters.new(parameters,
        'view' => 'chat',
        'debug' => false,
        'update_interval' => 10,
        'mingle_url' => "")
    end

    def execute
    begin
        render_view view_parameter, binding
      rescue Exception => e
        error_view(e)
      end
    end

    def error_view(e)
      template = ERB.new <<-ERROR
    h2. Murmur Chat Error:

    <%= e %><br>
    Stack trace: <%= e.backtrace.join("<br>") %>
      ERROR
      template.result binding
    end

    def render_view(view_file_name, binding)
      file = File.open("./vendor/plugins/murmur_chat/views/#{view_file_name}.erb")
      ERB.new(file.read).result binding
    end

    def can_be_cached?
      false # if appropriate, switch to true once you move your macro to production
    end

    def get_binding
      binding
    end

  end

end

