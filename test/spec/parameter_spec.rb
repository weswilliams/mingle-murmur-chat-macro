require "rspec"
require "./lib/murmur_chat"

describe "parameters" do

  before do
    @parameters = {}
    @project = double('project', :identifier => 'Test Project')
    @macro = CustomMacro::MurmurChat.new(@parameters, @project, nil)
  end

  describe "@macro#debug_parameter" do
    subject { @macro.debug_parameter }
    it { should == false }
  end

  describe "@macro#view_parameter" do
    subject { @macro.chat_parameter }
    it { should == 'chat' }
  end

end
