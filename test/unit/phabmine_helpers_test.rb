require_relative '../test_helper.rb'


class PollsControllerTest < ActionController::TestCase
  def test_thats_fine
    assert_equal 1+1, 2
  end

  def test_that_fails
    assert_equal 1, 2
  end
end
